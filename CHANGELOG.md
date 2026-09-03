# Changelog

All notable changes to `@truealter/n8n-nodes-alter` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-09-03

### Fixed
- `package.json` no longer declares `main: "index.js"`. No such file has ever
  existed in this repository, and `files` ships only `dist`, so the field named
  a path absent from both the tree and the tarball. n8n loads a community node
  through the `n8n` key rather than through `main`, so the node itself always
  worked, but `require('@truealter/n8n-nodes-alter')` failed and the manifest
  said otherwise. n8n's own starter template carries no `main` field either.

## [0.1.0] - 2026-09-03

First published version. The scaffold below was written on 2026-04-17 and the
package reached npm on 2026-09-03, so this section is dated by the release
rather than by the scaffold, and it describes what actually shipped.

### Added
- `Alter` node with four operations over JSON-RPC: `hello_agent`,
  `alter_resolve_handle`, `verify_identity` and `register_autonomous`.
- Node codex metadata (Communication / Productivity / AI) and SVG icon.
- Apache-2.0 licence.
- TypeScript build through tsc, with gulp copying the icons, per the
  n8n-nodes-starter convention.

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

### Removed
- The `AlterApi` credential. Nothing in the node used it, and shipping a
  credential a person is asked to fill in and that reaches nothing is worse
  than not offering one. The four operations above need no member credential.

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
