# August web implementation

## Confirmed scope

The user confirmed the language and web design on 2026-09-28 and asked for implementation, with a runnable OpenID Connect login proof. Both the OpenID Connect provider and the relying-party login flow belong in the same August application.

The language tenets are simplicity and developer scalability. Public declarations must show inputs, dependencies, effects, errors, and behavior in context. Imports and module exports remain explicit. Application logic belongs in August; native protocol and cryptographic operations belong behind safe capability interfaces and narrow unsafe adapters.

### Delivery requirements

- C output and pinned libwebsockets/GnuTLS HTTP/1.1, HTTP/2, HTTP/3, and TLS transport.
- Structured concurrency: scope-owned tasks and DI, start/wait for, ordered grouped and collection waits, always cleanup, cancellation, bounded workers, reference sharing, explicit locks, channels and broadcasts.
- Named first-party endpoints, typed binding sources, explicit serve selection in main.aug, JSON/HTML/binary and bounded streaming responses, outbound HttpClient, and HttpResponse<T>.
- JSX-style server components with checked named properties and children. handle endpoint(...) binds an HTTP action. input from form supplies a typed body. Successful actions follow redirects or reload the page. August application code runs on the server; generated transport wires events to requests.
- Immutable records with immutable collection fields, consuming deep freeze, optional versus nullable states, and private body fields with pure initialization.
- Checked unless errors, mapped errors, Problem Details, automatic 400/413/415/422 binding responses, request-scoped 500 handling, and termination after streaming has begun.
- Configurable interceptors in declaration order and explicit authentication capabilities.
- Strict OpenAPI generation configured in main.yaml, same-file endpoint tests, protocol integration tests, compiler diagnostics, documentation, and VS Code support.
- august.crypto and a same-application OpenID Connect provider/client proof, issuing a separate application session JWT after validating the provider ID token.

### Agreed public test seams

The confirmed design includes compiler/CLI behavior, same-file endpoint tests through the HTTP pipeline, and actual native protocol tests. The requested proof adds the externally observable login flow: discovery, authorization, code exchange, signature and claim validation, session issuance, protected access, and logout. Cryptographic verification is tested through public capability operations and independently specified vectors.

## Work sequence

1. Establish reproducible native dependencies and record current gaps.
2. Implement foundational syntax and safe runtime data operations in vertical slices.
3. Implement endpoint checking, HTTP transport, serialization, response control, and OpenAPI.
4. Implement server markup, components, forms, and endpoint action transport.
5. Implement structured concurrency and synchronized scoped resources.
6. Implement crypto capabilities, JOSE/JWT, and OpenID Connect application modules.
7. Exercise the native app end to end, address discovered gaps, update tooling, review, and run release gates.

## Proof profile

Authorization Code flow with S256 PKCE, unpredictable state and nonce, exact redirect-URI matching, one-use short-lived authorization codes, a discovery document and JWKS, validated signed ID tokens, and an independently signed expiring application-session JWT in an HttpOnly cookie. Provider and application session credentials have distinct validation contexts. Loopback HTTP is an explicit development configuration; external deployments use TLS.

This file records requirements, not a claim that delivery is complete. Actual verification and remaining gaps are recorded separately.
