# Security Policy

## Reporting a Vulnerability

~Alter takes the security of this n8n community node package seriously. If you
discover a vulnerability, please disclose it responsibly - **do not open a
public GitHub issue**.

**Email:** [security@truealter.com](mailto:security@truealter.com)

Include:

- A description of the issue and its impact.
- Reproduction steps, proof-of-concept, or a minimal failing workflow.
- The package version (`@truealter/n8n-nodes-alter`) and n8n version.
- Your handle or preferred credit name (optional).

## What to Expect

- **Acknowledgement** within 2 business days.
- **Initial assessment** (severity, scope, mitigation path) within 5 business days.
- **Fix + release** timing depends on severity; critical issues are patched on
  the next publish cycle and a co-ordinated disclosure date is agreed with the
  reporter.

## Scope

- `@truealter/n8n-nodes-alter` - the node and credential surface shipped from
  this repository.
- The node's interaction with `https://*.truealter.com` MCP endpoints.

**Out of scope** (report upstream):

- Vulnerabilities in `n8n` or `n8n-workflow` itself - report to
  [n8n's security policy](https://github.com/n8n-io/n8n/security).
- Vulnerabilities in the ~alter MCP server itself - report to
  [security@truealter.com](mailto:security@truealter.com) with `[mcp]` in the
  subject line.

## Safe Harbour

Researchers acting in good faith - operating within the scope above, avoiding
privacy violations, service disruption, and data exfiltration - will not be
subject to legal action from Alter Meridian Pty Ltd.
