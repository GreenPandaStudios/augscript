# HTTP architecture

The compiler checks routes, typed wire inputs, response representations, policy order, interceptor contracts, and served endpoint selection. The runtime handles sockets, transport backpressure, request scopes, and failure delivery. Application developers use the [web guide](web.md); this page describes the implementation boundary for contributors.

An endpoint's inputs name their HTTP source. JSON schemas are derived from checked data types. The selected routes define the reachable API and its generated OpenAPI document. Policies run before decoding; custom parameter interceptors run after it. Authentication and authorization enter through explicit injected capabilities. The compiler includes those capability calls in the effective handler contract.

The native transport uses libwebsockets with the pinned TLS and compression stack. A request has a bounded body, DI scope, task scope, and response lifecycle. Before headers, a failure can become a checked error response or an unexpected 500. After output begins, failure closes the stream. Completion logging observes transport completion or disconnect without including credentials or query strings.

Tasks are cooperative on one OS thread. Streaming sends bounded encoded items under backpressure. Disconnects and deadlines cancel the request scope, but synchronous native operations finish before cancellation is observed. The runtime does not provide multicore workers, inbound streaming bodies, WebSockets, or connection hijacking.

Same-file endpoint tests exercise the checked HTTP pipeline without a listening socket. Native socket tests cover HTTP/1.1, TLS, HTTP/2, HTTP/3, streaming, and disconnect paths separately. Broader HTTP conformance testing remains open. The [gap ledger](web-library-gaps.md) states remaining protocol, deployment, and identity-service work.
