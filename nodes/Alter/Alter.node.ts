import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { ApplicationError, NodeOperationError } from 'n8n-workflow';
import { createHash } from 'node:crypto';

const DEFAULT_MCP_ENDPOINT = 'https://mcp.truealter.com/api/v1/mcp';

/**
 * Validate that `input` is an allowed ALTER MCP endpoint.
 *
 * Two-layer IDN / Cyrillic-lookalike guard:
 *
 *   1. Reject raw input that contains any non-ASCII character before URL
 *      parsing.  This catches obvious lookalikes (Cyrillic х, etc.) that
 *      `new URL()` would silently normalise to punycode.
 *   2. Parse with `new URL()` and reject if any hostname label starts with
 *      `xn--` (i.e. is an ACE/punycode label).  This catches inputs that
 *      arrive already encoded (e.g. `https://xn--e1a.truealter.com/`).
 *
 * Both checks run before the endsWith('.truealter.com') allow-list test so
 * that an IDN variant can never satisfy the allow-list.
 *
 * Returns `true` only when the endpoint is ASCII-clean, parses as HTTPS, and
 * its hostname is exactly `mcp.truealter.com` or a subdomain thereof.
 */
function isAllowedAlterEndpoint(input: string): boolean {
	// Layer 1: reject any non-ASCII character in the raw string.
	if (/[^\x00-\x7F]/.test(input)) {
		return false;
	}

	let url: URL;
	try {
		url = new URL(input);
	} catch {
		return false;
	}

	// Must be HTTPS.
	if (url.protocol !== 'https:') {
		return false;
	}

	const hostname = url.hostname;

	// Layer 2: reject any ACE / punycode label anywhere in the hostname.
	if (hostname.split('.').some((label) => label.toLowerCase().startsWith('xn--'))) {
		return false;
	}

	// Allow-list: must be mcp.truealter.com itself or a *.truealter.com subdomain.
	return hostname === 'mcp.truealter.com' || hostname.endsWith('.truealter.com');
}

type McpToolName =
	| 'hello_agent'
	| 'alter_resolve_handle'
	| 'verify_identity'
	| 'register_autonomous'
	| 'register_autonomous_challenge';

interface McpJsonRpcResult {
	jsonrpc: '2.0';
	id: number;
	result?: {
		content?: Array<{ type: string; text?: string }>;
		isError?: boolean;
		[key: string]: unknown;
	};
	error?: { code: number; message: string; data?: unknown };
}

/**
 * Read the payload out of an MCP tool result.
 *
 * ~alter tools answer with a single text content block carrying JSON. The
 * ordinary path through this node hands `result` straight back to the
 * workflow and never needs to look inside it; the registration challenge
 * leg does, because the second leg is built from fields in the first.
 */
function unwrapMcpResult(payload: McpJsonRpcResult): Record<string, unknown> {
	if (payload?.error) {
		throw new ApplicationError(
			`~alter MCP error ${payload.error.code}: ${payload.error.message}`,
		);
	}
	const block = payload?.result?.content?.[0];
	if (block?.type === 'text' && typeof block.text === 'string') {
		try {
			return JSON.parse(block.text) as Record<string, unknown>;
		} catch {
			return { text: block.text };
		}
	}
	return (payload?.result ?? {}) as Record<string, unknown>;
}

/**
 * Find a nonce so sha256(challenge + ':' + nonce) opens with `bits` zero bits.
 *
 * The server sets the difficulty, so the ceiling is not ours to assume away.
 * Bounded twice, by difficulty and by wall clock, because this runs inside a
 * workflow execution: an unbounded loop here hangs the whole run.
 */
export function solveProofOfWork(
	challenge: string,
	bits: number,
	maxSeconds = 20,
	maxBits = 26,
): { nonce: string; attempts: number } {
	if (bits > maxBits) {
		throw new ApplicationError(
			`Proof-of-work difficulty ${bits} exceeds this node's ceiling of ${maxBits} bits`,
		);
	}
	if (bits <= 0) {
		return { nonce: '0', attempts: 1 };
	}
	const deadline = Date.now() + maxSeconds * 1000;
	let attempts = 0;
	for (;;) {
		const nonce = String(attempts);
		const digest = createHash('sha256').update(`${challenge}:${nonce}`).digest();
		attempts += 1;
		let zeroes = 0;
		for (const byte of digest) {
			if (byte === 0) {
				zeroes += 8;
				continue;
			}
			zeroes += Math.clz32(byte) - 24;
			break;
		}
		if (zeroes >= bits) {
			return { nonce, attempts };
		}
		if (attempts % 4096 === 0 && Date.now() > deadline) {
			throw new ApplicationError(
				`No nonce found for ${bits} bits in ${maxSeconds}s after ${attempts} attempts`,
			);
		}
	}
}

export class Alter implements INodeType {
	description: INodeTypeDescription = {
		displayName: '~Alter',
		name: 'alter',
		icon: 'file:alter.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Call ALTER identity infrastructure MCP tools (resolve ~handle, verify identity, compute belonging probability)',
		defaults: {
			name: '~Alter',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'MCP Endpoint',
				name: 'endpoint',
				type: 'string',
				default: DEFAULT_MCP_ENDPOINT,
				description: 'ALTER MCP JSON-RPC endpoint. Override only for staging or self-hosted surfaces.',
				placeholder: DEFAULT_MCP_ENDPOINT,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'alter_resolve_handle',
				options: [
					{
						name: 'Hello Agent',
						value: 'hello_agent',
						description: 'Handshake + capability probe (L0, free, unauthenticated)',
						action: 'Handshake with the ALTER MCP server',
					},
					{
						name: 'Resolve Handle',
						value: 'alter_resolve_handle',
						description: 'Resolve a ~handle to its canonical form + visibility flags. No PII. (L0, free)',
						action: 'Resolve a handle',
					},
					{
						name: 'Verify Identity',
						value: 'verify_identity',
						description: 'Check whether a person is known to the ALTER identity field (L0, free, 30/hr)',
						action: 'Verify an identity',
					},
					{
						name: 'Register Identity',
						value: 'register_autonomous',
						description:
							'Mint your own ~handle, keyless and free. Solves the proof-of-work for you, so this is one node run rather than two. (L0, free)',
						action: 'Register a handle of your own',
					},
				],
			},
			// --- alter_resolve_handle ---
			{
				displayName: 'Handle',
				name: 'handle',
				type: 'string',
				default: '',
				required: true,
				placeholder: '~handle',
				description: 'ALTER ~handle to resolve. Leading ~ optional.',
				displayOptions: {
					show: {
						operation: ['alter_resolve_handle'],
					},
				},
			},
			// --- verify_identity ---
			{
				displayName: 'Handle',
				name: 'verifyHandle',
				type: 'string',
				default: '',
				required: true,
				placeholder: '~handle',
				description: 'Handle to verify against the ALTER identity field',
				displayOptions: {
					show: {
						operation: ['verify_identity'],
					},
				},
			},
			// --- register_autonomous ---
			{
				displayName: 'Agent Name',
				name: 'agentName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'pricing-bot',
				description: 'A name for the identity you are about to mint',
				displayOptions: {
					show: {
						operation: ['register_autonomous'],
					},
				},
			},
			{
				displayName: 'Requested Handle',
				name: 'requestedHandle',
				type: 'string',
				default: '',
				placeholder: '~yourhandle',
				description: 'Optional ~handle to ask for. Leave empty and one is generated for you.',
				displayOptions: {
					show: {
						operation: ['register_autonomous'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as McpToolName;
				const endpoint =
					(this.getNodeParameter('endpoint', itemIndex, DEFAULT_MCP_ENDPOINT) as string) ||
					DEFAULT_MCP_ENDPOINT;

				// Reject IDN / Cyrillic-lookalike endpoints before
				// any network activity. isAllowedAlterEndpoint applies both a
				// non-ASCII raw-input check (layer 1) and a punycode-label check
				// (layer 2) prior to the *.truealter.com allow-list test.
				if (!isAllowedAlterEndpoint(endpoint)) {
					throw new NodeOperationError(
						this.getNode(),
						`Endpoint rejected: "${endpoint}" is not an allowed ALTER MCP surface. Must be HTTPS and hostname must be mcp.truealter.com or a *.truealter.com subdomain with no IDN/punycode labels.`,
						{ itemIndex },
					);
				}

				const toolArgs: IDataObject = {};
				switch (operation) {
					case 'hello_agent':
						break;
					case 'alter_resolve_handle': {
						const raw = (this.getNodeParameter('handle', itemIndex) as string).trim();
						toolArgs.query = raw.startsWith('~') ? raw : `~${raw}`;
						break;
					}
					case 'verify_identity': {
						const raw = (this.getNodeParameter('verifyHandle', itemIndex) as string).trim();
						toolArgs.handle = raw.startsWith('~') ? raw : `~${raw}`;
						break;
					}
					case 'register_autonomous': {
						const agentName = (this.getNodeParameter('agentName', itemIndex) as string).trim();
						const requested = (
							this.getNodeParameter('requestedHandle', itemIndex, '') as string
						).trim();

						// Leg one, anonymous by design. The pair mints a principal for
						// whoever calls it, so a credential here would bind the new
						// handle to this workflow's owner rather than to the caller.
						const challengeResponse = await this.helpers.httpRequest({
							method: 'POST',
							url: endpoint,
							headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
							body: {
								jsonrpc: '2.0',
								id: itemIndex + 1,
								method: 'tools/call',
								params: {
									name: 'register_autonomous_challenge',
									arguments: { agent_name: agentName },
								},
							},
							json: true,
							disableFollowRedirect: true,
						});
						// Both helpers are pure and hold no node handle, so they raise
						// ApplicationError. Re-raise as NodeOperationError here so a
						// registration failure is attributed to this node and this item,
						// the way every other failure on this path already is.
						let challenge: string | undefined;
						let nonce: string;
						try {
							const challengeData = unwrapMcpResult(
								challengeResponse as McpJsonRpcResult,
							);
							challenge = challengeData.challenge as string | undefined;
							const difficulty = Number(challengeData.difficulty ?? 0);
							if (!challenge) {
								throw new NodeOperationError(
									this.getNode(),
									'Registration challenge returned no challenge token',
									{ itemIndex },
								);
							}
							nonce = solveProofOfWork(challenge, difficulty).nonce;
						} catch (powError) {
							if (powError instanceof NodeOperationError) {
								throw powError;
							}
							throw new NodeOperationError(
								this.getNode(),
								(powError as Error).message,
								{ itemIndex },
							);
						}

						toolArgs.agent_name = agentName;
						toolArgs.challenge = challenge;
						toolArgs.nonce = nonce;
						if (requested) {
							toolArgs.requested_handle = requested.startsWith('~')
								? requested
								: `~${requested}`;
						}
						break;
					}
					case 'register_autonomous_challenge':
						break;
				}

				const headers: IDataObject = {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				};

				// Every operation on this node is free and L0, and registration is
				// deliberately anonymous, so no credential is attached to any of
				// them. A credential on the register pair would bind the minted
				// handle to this workflow's owner instead of to whoever asked.

				const body = {
					jsonrpc: '2.0',
					id: itemIndex + 1,
					method: 'tools/call',
					params: {
						name: operation,
						arguments: toolArgs,
					},
				};

				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: endpoint,
					headers: headers as Record<string, string>,
					body,
					json: true,
					returnFullResponse: true,
					// Disable redirect-following so the Authorization: Bearer
					// header cannot be forwarded to a third-party host via a 3xx response
					// from any *.truealter.com surface (CDN alias, staging misconfiguration,
					// or subdomain takeover).
					disableFollowRedirect: true,
				};

				let response: Awaited<ReturnType<typeof this.helpers.httpRequest>>;
				try {
					response = await this.helpers.httpRequest(requestOptions);
				} catch (reqError) {
					// When disableFollowRedirect is true, axios surfaces a 3xx as an error
					// with a response attached. Detect it and emit a clear bearer-leak-guard
					// message rather than a raw axios status error.
					const status: number | undefined =
						(reqError as { response?: { status?: number } }).response?.status;
					const location: string =
						(reqError as { response?: { headers?: { location?: string } } }).response?.headers
							?.location ?? 'unknown';
					if (status !== undefined && status >= 300 && status < 400) {
						throw new NodeOperationError(
							this.getNode(),
							`Refused to follow redirect from ${endpoint} (HTTP ${status} → ${location}) - bearer-leak guard. Re-check the endpoint allow-list or the remote canonicalisation.`,
							{ itemIndex },
						);
					}
					throw reqError;
				}
				const payload = response.body as McpJsonRpcResult;

				if (payload?.error) {
					throw new NodeOperationError(
						this.getNode(),
						`ALTER MCP error ${payload.error.code}: ${payload.error.message}`,
						{ itemIndex },
					);
				}

				returnData.push({
					json: {
						operation,
						result: payload?.result ?? null,
						http_status: response.statusCode,
					},
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
