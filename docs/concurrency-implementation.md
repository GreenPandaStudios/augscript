# Structured execution implementation

This is an implementation work note, not a delivery claim.

The confirmed model uses lexical scopes, ordered waits, cooperative cancellation, guaranteed cleanup, shared read references, exclusive mutation, bounded multicore workers and nonblocking I/O. An unhandled child failure cancels its siblings; a request failure leaves other requests running.

The same-app OIDC flow requires an outbound request to suspend its execution while the native HTTP event loop continues accepting provider requests. Running that request synchronously inside an HTTP callback would deadlock.

Implementation seams:

- Each execution owns its root-frame chain, error state and scope stack. The collector traces all suspended executions and native retained roots.
- Scoped DI caches belong to scope instances. Shared bindings remain process values; fresh bindings remain uncached.
- Managed request values cross the transport seam through retained GC roots. Native buffers have explicit transport ownership.
- A task captures read references and moves owned arguments. Mutable argument loans stay active until join. Collection waits preserve input order.
- Native I/O starts on the event loop and resumes a suspended execution on completion or cancellation. No worker waits on a blocking socket.
- Multicore execution requires collector safepoints and synchronization of explicit Shared values. A single event loop alone must not be presented as the completed multicore requirement.

Verification must include two requests in the same process that call each other, bounded fan-out, sibling cancellation, cleanup on errors and disconnects, lock restrictions and mutation alias rejection.
