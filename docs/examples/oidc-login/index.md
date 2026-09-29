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

A login page, provider, client, session JWT, and logout flow in one August project.

Read a file below to see its highlighted source and the Markdown produced by `aug spec`. Choose **Indentation** or **Braces** above the code. Both views describe the same checked program; your choice is kept when you open another file.

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

From a repository checkout with August installed:

```sh
aug check examples/oidc-login
aug spec examples/oidc-login
aug test examples/oidc-login
aug run examples/oidc-login
```

Open `http://127.0.0.1:8787` and sign in with **ada** / **august-demo**. This development example keeps accounts, signing keys, and sessions in process memory. See [web and crypto](../../web.md) and [the remaining library gaps](../../web-library-gaps.md).

[Browse all examples](../index.md)
