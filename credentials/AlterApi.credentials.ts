import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

const DEFAULT_MCP_ENDPOINT = 'https://mcp.truealter.com/api/v1/mcp';

/**
 * Validate that `input` is an allowed ALTER MCP endpoint.
 *
 * Two-layer IDN / Cyrillic-lookalike guard:
 *
 *   1. Reject raw input that contains any non-ASCII character before URL
 *      parsing.  Catches lookalikes (Cyrillic х U+0445, etc.) that
 *      `new URL()` would silently normalise to punycode.
 *   2. Parse with `new URL()` and reject if any hostname label starts with
 *      `xn--` (ACE/punycode label).  Catches pre-encoded IDN inputs.
 *
 * Exported so consuming code (e.g. custom credential handlers) can apply
 * the same check before dispatching requests with the stored endpoint.
 * The declarative `test.request` below uses `$credentials.endpoint` via
 * n8n's template engine; callers that read this credential at runtime MUST
 * pass the endpoint through `isAllowedAlterEndpoint` before use.
 */
export function isAllowedAlterEndpoint(input: string): boolean {
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

export class AlterApi implements ICredentialType {
	name = 'alterApi';
	displayName = '~Alter Member API';
	documentationUrl = 'https://github.com/true-alter/n8n#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Member Credential',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'The member credential `alter login` puts on the machine you signed in on. Needed only for paid tools. hello_agent, alter_resolve_handle and verify_identity are free and need nothing here. If it stops working, sign in again with `alter login`; it refreshes in place.',
		},
		{
			displayName: 'MCP Endpoint',
			name: 'endpoint',
			type: 'string',
			default: DEFAULT_MCP_ENDPOINT,
			description:
				'Override only for staging or self-hosted ALTER surfaces. Must be an HTTPS URL on *.truealter.com - other values are rejected before any request is sent.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// The credential-test baseURL is hardcoded to the default
	// ALTER MCP endpoint rather than interpolated from $credentials.endpoint.
	// A user-supplied endpoint in the credential form would otherwise receive
	// the bearer token on "Test" click, even for values that the node itself
	// later rejects via isAllowedAlterEndpoint (which guards the node's own
	// request path in nodes/Alter/Alter.node.ts). The "Test" button answers
	// "does this credential authenticate against ALTER?"; validating custom
	// endpoints is done by executing the node.
	test: ICredentialTestRequest = {
		request: {
			baseURL: DEFAULT_MCP_ENDPOINT,
			url: '',
			method: 'POST',
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'hello_agent', arguments: {} },
			},
		},
	};
}
