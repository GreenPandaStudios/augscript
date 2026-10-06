---
title: "common data flow"
generated: true
source: "examples/oidc-login/.aug-spec/diagrams/folders/common/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# common data flow

[OpenID Connect login application](../../../index.md)

[Project overview](../../index.md)

This view opens the common folder one level deeper. Each arrow shows the called operation and the data it returns to its caller. Calls inside a file stay in that file’s sequence view.

### client calls

```mermaid
flowchart TD
    n0["client"]
    n1["headers"]
    n2["keys"]
    n3["settings"]
    n4["views"]
    n0 -->|"securityHeaders / withCookie(headers, name, …) → Headers"| n1
    n0 -->|"SigningKeys.session → RsaPrivateKey"| n2
    n0 -->|"settings → Settings"| n3
    n0 -->|"Page(title, children) → Html"| n4
```

### Startup calls

```mermaid
flowchart TD
    n0["keys"]
    n1["Startup"]
    n1 -->|"initializeKeys"| n0
```

### provider calls

```mermaid
flowchart TD
    n0["headers"]
    n1["keys"]
    n2["settings"]
    n3["views"]
    n4["provider"]
    n4 -->|"securityHeaders / withCookie(headers, name, …) → Headers"| n0
    n4 -->|"SigningKeys.provider → RsaPrivateKey"| n1
    n4 -->|"settings → Settings"| n2
    n4 -->|"Page(title, children) → Html"| n3
```

### Package boundaries

::: details headers package calls

```mermaid
flowchart LR
    n0["headers"]
    n1["web"]
    n0 -->|"cookie(name, value, …) → Headers"| n1
```

:::

::: details keys package calls

```mermaid
flowchart LR
    n0["keys"]
    n1["crypto"]
    n0 -->|"Crypto.generateRsa → RsaPrivateKey"| n1
```

:::

::: details Data crossing these boundaries (13 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| client | headers | [securityHeaders](../../../common/headers.md#symbol-securityHeaders) | Headers |
| client | headers | [withCookie](../../../common/headers.md#symbol-withCookie) · headers: Headers, name: string, value: string, path: string, maxAge: int, secure: bool | Headers |
| client | keys | [SigningKeys.session](../../../common/keys.md#symbol-SigningKeys.session) · interface dispatch | RsaPrivateKey |
| client | settings | [settings](../../../common/settings.md#symbol-settings) | Settings |
| client | views | [Page](../../../common/views.md#symbol-Page) · title: string, children: List\<Html\> | Html |
| headers | web | [cookie](../../../dependencies/packages/%40git/url_897efafd565158fc4908/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-cookie) · name: string, value: string, path: string, maxAge: int, secure: bool | Headers |
| keys | crypto | [Crypto.generateRsa](../../../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.generateRsa) · interface dispatch | RsaPrivateKey |
| Startup | keys | [initializeKeys](../../../common/keys.md#symbol-initializeKeys) | void |
| provider | headers | [securityHeaders](../../../common/headers.md#symbol-securityHeaders) | Headers |
| provider | headers | [withCookie](../../../common/headers.md#symbol-withCookie) · headers: Headers, name: string, value: string, path: string, maxAge: int, secure: bool | Headers |
| provider | keys | [SigningKeys.provider](../../../common/keys.md#symbol-SigningKeys.provider) · interface dispatch | RsaPrivateKey |
| provider | settings | [settings](../../../common/settings.md#symbol-settings) | Settings |
| provider | views | [Page](../../../common/views.md#symbol-Page) · title: string, children: List\<Html\> | Html |

:::

## Files in this folder

| Module | Read |
| --- | --- |
| common/export.aug | [Flow and sequences](../../../common/export-diagrams.md) · [Explanation](../../../common/export.md) |
| common/headers.aug | [Flow and sequences](../../../common/headers-diagrams.md) · [Explanation](../../../common/headers.md) |
| common/keys.aug | [Flow and sequences](../../../common/keys-diagrams.md) · [Explanation](../../../common/keys.md) |
| common/settings.aug | [Flow and sequences](../../../common/settings-diagrams.md) · [Explanation](../../../common/settings.md) |
| common/views.aug | [Flow and sequences](../../../common/views-diagrams.md) · [Explanation](../../../common/views.md) |
