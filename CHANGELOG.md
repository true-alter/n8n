# Changelog

All notable changes to `@truealter/n8n-nodes-alter` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- The release workflow goes to npm through trusted publishing on GitHub OIDC.
  The `NPM_TOKEN` secret and its `NODE_AUTH_TOKEN` binding are gone, so this
  repository holds no credential on that path at all. Node moves to 24 and npm
  is pinned to 11.5.1 or newer, which is where the OIDC exchange arrived.
- The masthead image is an absolute raw URL against the public cut repo, which
  is where `package.json` already points. It was a relative path into `docs/`,
  and `files` has never shipped that directory, so the npm listing would have
  opened on a broken image.
- The masthead subtitle drops its trailing fullstop.
- The member credential is named `~Alter Member API`. n8n's own lint requires a
  credential display name to end in API, and the autofix produced
  `~Alter Member Credential API`, which is not a name anybody would write.

### Fixed
- Lint is green, so the release can actually reach its publish step. It was red
  on four errors and the workflow lints before it publishes, meaning a tag push
  would have failed on the first run. Three were bare `Error` throws in helpers
  outside `execute()`, now `OperationalError` where an external system or the
  clock failed and `UserError` where the caller asked for more proof-of-work
  difficulty than this node attempts.
- The Requested Handle placeholder no longer looks like a real member handle.
  The code-comment leak scanner blocks any `~handle`-shaped token outside its
  carved placeholder set, and it cannot tell an invented example from a live
  member, which is the point of the check. It is `~yourhandle` now, which reads
  better in that field anyway.
- README: Compute Belonging now describes a person-role pairing.

## [0.1.0] - 2026-04-17

### Added
- Initial scaffold of the n8n community node for the ALTER identity MCP server.
- `Alter` node with four operations over JSON-RPC: `hello_agent`, `alter_resolve_handle`, `verify_identity`, `compute_belonging`.
- `AlterApi` credential for member-scoped bearer-token authentication on premium tools.
- Node codex metadata (Communication / Productivity / AI) and SVG icon.
- Apache-2.0 licence.

### Infrastructure
- TypeScript build pipeline (tsc) + gulp icon-copy per n8n-nodes-starter convention.
- Published to npm with provenance.
