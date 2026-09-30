---
title: "OpenID Connect login application"
generated: true
source: "examples/oidc-login"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# OpenID Connect login application

One executable hosts a login page, an OpenID Connect provider and client, session JWTs, and logout. Accounts, keys, and sessions are held in memory for this development demonstration.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`client/contracts.aug`](client/contracts.md)
- [`client/endpoints.aug`](client/endpoints.md)
- [`client/export.aug`](client/export.md)
- [`client/login.aug`](client/login.md)
- [`client/logout.aug`](client/logout.md)
- [`client/protocol.aug`](client/protocol.md)
- [`client/session.aug`](client/session.md)
- [`client/views.aug`](client/views.md)
- [`common/export.aug`](common/export.md)
- [`common/headers.aug`](common/headers.md)
- [`common/keys.aug`](common/keys.md)
- [`common/settings.aug`](common/settings.md)
- [`common/views.aug`](common/views.md)
- [`provider/authorization.aug`](provider/authorization.md)
- [`provider/contracts.aug`](provider/contracts.md)
- [`provider/credentials.aug`](provider/credentials.md)
- [`provider/discovery.aug`](provider/discovery.md)
- [`provider/export.aug`](provider/export.md)
- [`provider/token.aug`](provider/token.md)
- [`provider/userinfo.aug`](provider/userinfo.md)
- [`provider/views.aug`](provider/views.md)

- [`main.yaml`](main-yaml.md)

## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/oidc-login
aug spec examples/oidc-login
aug test examples/oidc-login
aug run examples/oidc-login
```

Open `http://127.0.0.1:8787` and sign in with **ada** / **august-demo**. This development example keeps accounts, signing keys, and sessions in process memory. See [web and crypto](../../web.md) and [the remaining library gaps](../../web-library-gaps.md).

[Browse all examples](../index.md)
