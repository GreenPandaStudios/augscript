---
title: "main.yaml · OpenID Connect login application"
generated: true
source: "examples/oidc-login/main.yaml"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.yaml`

[OpenID Connect login application](index.md) · Project configuration

```yaml
block_style: indent
web:
  host: 127.0.0.1
  body_limit: 16384
  response_limit: 1048576
openapi:
  enabled: true
  title: August OpenID Connect demo
  version: 0.1.0
  path: /openapi.json
  docs: /docs
  output: .aug-build/openapi.json

packages:
  crypto: "https://github.com/GreenPandaStudios/augscript/src/stdlib/crypto#b14a0f9aa41f1ce58bd51133bcdc424033e40d40"
  json: "https://github.com/GreenPandaStudios/augscript/src/stdlib/json#v0.19.0"
  memory: "https://github.com/GreenPandaStudios/augscript/src/stdlib/memory#v0.19.0"
  time: "https://github.com/GreenPandaStudios/augscript/src/stdlib/time#v0.19.0"
  web: "https://github.com/GreenPandaStudios/augscript/src/stdlib/web#v0.19.0"
```
