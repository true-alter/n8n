<div align="center">

<img src="https://raw.githubusercontent.com/true-alter/n8n/main/docs/alter-mark.svg" alt="" height="96">

# ~alter n8n Community Node

**Identity primitives on your workflow canvas**

[![~alter](https://img.shields.io/badge/~alter-identity%20infrastructure-C9A84C?style=flat-square)](https://truealter.com)
[![n8n Community Node](https://img.shields.io/badge/n8n-community%20node-555?style=flat-square)](https://docs.n8n.io/integrations/community-nodes/)
[![npm](https://img.shields.io/badge/npm-%40truealter%2Fn8n--nodes--alter-555?style=flat-square)](https://www.npmjs.com/package/@truealter/n8n-nodes-alter)
[![Licence](https://img.shields.io/badge/licence-Apache--2.0-555?style=flat-square)](./LICENSE)

[What it does](#what-is-alter-n8n) · [Install](#install) · [The operations](#the-operations) · [Why this sits under ~alter](#why-this-sits-under-alter)

</div>

## What is ~alter n8n?

A community node for n8n. It sits on the canvas next to your other nodes and
does four things against ~alter's identity MCP server, over the same JSON-RPC
wire an MCP client would use.

- Resolves a `~handle` to its canonical form and its visibility flags
- Checks whether a handle is known to the ~alter identity field at all
- Mints you a `~handle` of your own, keyless, with no account behind it
- Answers a handshake probe, so you can confirm the wire is live before
  building a workflow on top of it

All four run free with no setup and no credential. Registration answers a
proof-of-work challenge before ~alter mints anything, and the node solves it
for you inside the one run, so this is a single node on the canvas rather
than two wired together.

## Install

Search the Community Nodes tab from inside n8n:

```
Settings → Community Nodes → Install → @truealter/n8n-nodes-alter
```

Self-hosted n8n installs the same package with npm, from the data directory:

```bash
cd ~/.n8n
npm install @truealter/n8n-nodes-alter
```

Restart n8n. The `~Alter` node appears in the node panel under Communication,
Productivity and AI, and a canvas search for "alter" finds it the way it
would find any other node.

## Your first call

### 1. Add the node to a workflow

Drop `Alter` onto the canvas, wired after whatever step first produces or
receives a handle.

### 2. Pick Resolve Handle and run it

Set Operation to `Resolve Handle`, type a `~handle`, execute the node. No
credential needed. This operation is free.

### 3. Switch to Register Identity

Set Operation to `Register Identity`, give it a name, run it. You get back a
`~handle` of your own and an agent key. Nothing was configured first and
nothing was paid.

### 4. Keep the key

The key comes back once and never again, so store it before you run anything
else. The response also carries `earn_eligible`, which is no on a freshly
minted handle. Free queries work straight away.

## The operations

| Operation | MCP tool | Tier | Needs |
|---|---|---|---|
| Hello Agent | `hello_agent` | Free | Nothing |
| Resolve Handle | `alter_resolve_handle` | Free | A handle |
| Verify Identity | `verify_identity` | Free, 30/hr | A handle |
| Register Identity | `register_autonomous` | Free | A name, and optionally the `~handle` you want |

## Settings

There is no credential to configure. Every operation is free, and
registration is sent anonymously on purpose, so the `~handle` it mints
belongs to whoever ran the node rather than to whoever owns the workflow.

- **MCP Endpoint**. Defaults to `https://mcp.truealter.com/api/v1/mcp`.
  Override it only for a staging or self-hosted ~alter surface. Anything off
  `*.truealter.com` is refused before a request leaves your instance.

## Why this sits under ~alter

A workflow you build here already moves data between systems you did not
write, on the strength of nodes somebody else maintains. This one adds a
read of a person to that chain, and it is the one system in it built so that
read pays them and answers to them rather than to whoever built the
workflow.

Most of what a workflow knows about a person today came from a form they
filled in once, sitting inside whichever tool captured it, gone the day that
tool is. ~Alter runs the other order. A `~handle` is claimed once and it
carries a record built from what somebody has actually done rather than what
they typed into your intake step. Wire this node in after your form capture
or your CRM trigger or wherever a person first shows up, and the check runs
against a record nobody in your workflow assembled.

Confirming a handle exists costs the reader nothing. Reading further than
that costs whoever is asking, that money reaches the person being read, and
they set how far into their own record any workflow, yours included, is let
in.

<details><summary><b>I want to know more</b></summary><br><p>Your friends do not know you from a login. Neither does your family, or the people you work with, or your sports team. They know who you are from how you have shown up, over years. You may look and sound nothing like you did ten years ago and it is still you.</p><p>Software still asks the narrow question. A password at the login screen. A token in the app. Each one checks whether this is the right person, right now, at this exact spot, and then looks away. Everything in between is invisible to it, and that is almost all of your life. The AI tools made it worse, because one of them writes in your name now, and when somebody asks who allowed it, there is no answer anywhere on this machine.</p><p><b>One name, and the record under it is yours.</b> <code>~yourname</code> works at every tool that speaks the protocol, so nothing is set up twice and there is no key to paste, at any point. What is in the record was read from what you did, not typed into a box by you or guessed at by a model. You can cut off access to any of it with one command. No form, no review.</p><p><b>Being read pays you.</b> Anyone can check for free that your handle exists. Reading further, past the fact of you, costs the reader money, that money goes to you, and you decide who gets to read what. Collectives hold a record on the same terms, because it is one record at every scale and the same form holds you, your team, and your country. A union, a club, a trade body, or a group of people who have never met can vouch for their own members and be read the same way you are.</p><p><b>Threads are how you get somewhere.</b> A thread is something you are working towards. You take one on yourself, or ~Alter plants one from what it can already see, or a collective confers one on you. What gets read is the trail you leave while you are doing it, never a certificate at the end.</p><p>All of that is the short version of an argument set out properly, in eight chapters at <a href="https://truealter.com/origin">truealter.com/origin</a>. Its seventy-six predictions were each written so the data could come back and say no. Five of them did, and those five are still published alongside the rest.</p></details>

<details><summary><b>I want to check it myself</b></summary>

None of it needs taking on trust. Hand this to the AI you already use and
let it take you through in your own words.

```text
Go to truealter.com, find the genesis and the origin papers, and read all of
them. Then start a discussion with me in my own language, no jargon.

Ask me one question at a time and wait for my answer. Follow what I am curious
about, not the order the site is written in.

Do not only read the pages. Connect to their interface directly and call
get_started. That tells you where I am and what comes next, and we work the
rest of this from there.

If I have a ~handle I will give it to you. If I do not and I decide I want
one, set it up with me here.

What I want to understand is what ~Alter is, how it applies to me, and what it
means for everyone else. Find me somewhere in it, and not the version written
for people who work in technology. Find the life nearest mine and walk me
through it, including what it would cost me.

Try to prove them wrong. Go and find where they show their working, and if
something is unclear or does not hold up, say so.
```

</details>

The `~alter` command line is where a person sets those terms for themselves.
This node only ever reads what they have already allowed, from inside a
workflow that is not the one asking them.

<details><summary><h3>If a call does not go through</h3></summary>

**`Endpoint rejected: "..." is not an allowed ~alter MCP surface`**

The `MCP Endpoint` field only accepts an HTTPS address on `mcp.truealter.com`
or a `*.truealter.com` subdomain and it is checked before anything is sent,
not returned as an error from the server. Fix the address rather than the
request.

**`~alter MCP error ...`**

The MCP server answered and declined the call, most often a registration
whose proof-of-work expired before the second leg reached it. The message
text names which. Run it again; the challenge is cheap.

**A redirect error on an address you typed by hand correctly**

The node refuses to follow redirects on purpose so a bearer token never
lands on a host it was not meant for. Treat this as a fault worth reporting
rather than a workflow bug.

**Registration refuses the difficulty**

~alter chooses the proof-of-work difficulty and this node caps how far it
will go, so a raised difficulty is refused rather than ground at inside your
workflow run. Report it rather than working around it.

</details>

<details><summary><h3>The protocols underneath it</h3></summary>

The record formats are open Internet-Drafts so somebody else's
implementation reads and writes the same records this one does without
asking us. These are the drafts this node actually rests on.

| Draft | What it specifies |
|---|---|
| [`mcp-dns-discovery`](https://datatracker.ietf.org/doc/draft-morrison-mcp-dns-discovery/) | The DNS records that publish a `~handle`, the server that answers for it, and the signed envelope bound to it. |
| [`consent-settlement`](https://datatracker.ietf.org/doc/draft-morrison-consent-settlement/) | Binding a read of somebody's identity to their own recorded consent, and settling part of any payment for it to them. |

Eighteen drafts make up the whole stack. The rest are on the [IETF datatracker](https://datatracker.ietf.org/doc/search/?name=draft-morrison&activedrafts=on).

</details>

<details><summary><h3>The rest of it</h3></summary>

`~alter` is one identity rail with several ways in, and this node is one of
them.

| Name | What it is |
|---|---|
| **[`@truealter/cli`](https://www.npmjs.com/package/@truealter/cli)** | The command line, and the front door for a person. |
| **[homebrew-tap](https://github.com/true-alter/homebrew-tap)** | That command line, packaged for macOS and Linux. |
| **[runtime](https://github.com/true-alter/runtime)** | The daemon that keeps your `~handle` known on your own machine. |
| **[sdk](https://github.com/true-alter/sdk)** | Reading identity from your own code. |
| **[obsidian](https://github.com/true-alter/obsidian)** | ~Alter inside an Obsidian vault, on-device. |
| **[mcp-ollama](https://github.com/true-alter/mcp-ollama)** | Local models, for work that should stay on the machine it runs on. |
| **n8n** | The same identity primitives, called from an n8n workflow. **You are here.** |

Bug reports and small patches are welcome, see
[CONTRIBUTING.md](./CONTRIBUTING.md). Security issues go to
[security@truealter.com](mailto:security@truealter.com), never a public
issue.

Apache-2.0. See [LICENSE](./LICENSE) for the full text.

</details>

---

<div align="center">

<sub><b>~alter</b> is identity infrastructure. Your name is <code>~yourname</code> and claiming one is free.</sub>

<sub>
<a href="https://truealter.com">Website</a> &nbsp;·&nbsp;
<a href="https://truealter.com/docs">Docs</a> &nbsp;·&nbsp;
<a href="https://truealter.com/origin">The argument in eight chapters</a> &nbsp;·&nbsp;
<a href="https://datatracker.ietf.org/doc/search/?name=draft-morrison&activedrafts=on">The open specifications</a> &nbsp;·&nbsp;
<a href="https://github.com/true-alter">Every repository</a>
</sub>

</div>
