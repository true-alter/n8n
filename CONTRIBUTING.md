# Contributing to `@truealter/n8n-nodes-alter`

Thank you for your interest in contributing. This package ships the official
n8n community node for ~alter's identity infrastructure MCP.

## Build + Test

Requires Node.js `>=20.15`.

```bash
npm ci
npm run lint
npm run build
npm test
```

`npm run dev` runs `tsc --watch` for iterative development.

## Pull Requests

- One concern per PR.
- All PRs require review before merge. Branch protection is enforced on `main`.
- CI must pass: lint, build, commit-trailer verification.

## Commit trailers

Every commit must carry the identity-attributed commit trailer block per the
[draft spec](https://datatracker.ietf.org/doc/draft-morrison-identity-attributed-commits/).
The minimum form:

```
<imperative subject line>

<body explaining what + why>

Acted-By: ~<sovereign-handle>
Drafted-With: ~cc-<model-handle>
Co-Authored-By: <AI model name> <noreply@anthropic.com>
```

- `Acted-By:` - Sovereign-tier `~handle` of the human author.
- `Drafted-With:` - Instrument-tier handle of the AI used to draft the change
  (e.g. `~cc-sonnet-4-6`). Omit if no AI was used.
- `Co-Authored-By:` - GitHub UI compatibility trailer.

Cross-slot category errors are validated per commit, so an Instrument-tier
handle in an `Acted-By:` slot is rejected rather than ignored.

Full spec: [`draft-morrison-identity-attributed-commits`](https://datatracker.ietf.org/doc/draft-morrison-identity-attributed-commits/).

## Security

Do not open public issues for security vulnerabilities. See
[SECURITY.md](./SECURITY.md) for the disclosure flow.

## Licence

By contributing you agree that your contributions are licensed under the
Apache License 2.0 (see [LICENSE](./LICENSE)).
