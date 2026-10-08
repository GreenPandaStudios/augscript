# Pass a small function

A pure function or expression can fill a single-method interface. Use it when the interface already describes the operation you want, such as selecting or transforming collection values.

## Select and transform values

**main.aug**

```aug project=pure-callbacks-guide file=main.aug
import Predicate and filter and transform from august.collections
import positive from rules

Predicate<int> accepts = positive
print(value=accepts.accepts(value=3))

minimum = 2
Predicate<int> above = (int value) => value > minimum
minimum = 99

for value in filter(values=[1, 2, 3], predicate=above):
    print(value=value)

for value in transform(
    values=[2, 3],
    transformation=(int value) => value * 2
):
    print(value=value)
```

**rules.aug**

```aug project=pure-callbacks-guide file=rules.aug
positive(int value) returns bool:
    return value > 0
```

Run `aug run .`. The output is `true`, `3`, `4`, and `6`, each on its own line. `accepts` delegates to the imported function. `above` keeps the value of `minimum` at creation, so the later assignment does not change its decision. The transformation doubles each selected input. Its integer result supplies the result type argument of `transform`.

## Keep the interface visible

`Predicate<int>` declares `accepts(int value) returns bool`. Callbacks use that method and its labels: `accepts.accepts(value=3)`. An ordinary function reference must have the same public labels and input types; their declaration order may differ. A closure lists the interface's labels in order and gives each input its type. The interface's expected result checks the expression.

A typed binding, return, or call input supplies the interface. A bare `callback = (int value) => value > 0` has no interface and is rejected. You can define your own concrete single-method interface using ordinary declarations and imports. An inherited single abstract method works too when every ancestor exposes the same supported pure signature. Multiple methods and default method bodies require an ordinary implementation class.

## Capture values that can outlive the call

Scalars are copied when the closure is created. Deeply immutable records and frozen collections retain their managed references. The callback keeps them reachable while it is stored in a field, a collection, or a returned value. Freeze a collection explicitly before capturing it. Capturing a mutable collection, an owned object, or a borrowed reference is rejected. An erased `Data` or generic tuple child does not itself prove immutability; freeze its container before capture. Records carry their existing deep-frozen storage guarantee. These rules do not grant mutation or extend a borrowed lifetime.

Callbacks in this first profile have managed data inputs and results, perform no I/O or declared mutation, and propagate no checked failure. They can call other checked pure functions. Native functions, generic function references, injected inputs, owned transfers, default inputs, and annotated functions require an ordinary adapter. Expression closures have one result expression; use `match` when that expression needs a decision. They do not retain an enclosing class receiver. Read a permitted scalar or immutable field into a local before capturing it.

A worker can create and use a callback on its own heap. A callback itself cannot be passed into or returned from a worker: worker transfers still require copied data. Cooperative tasks retain their normal scope, waiting, and capture rules.

## Read and navigate the callback

Hover over `=>` or a converted function name to see the checked interface, result, and captures or implementation link. Completion offers a `callback` expression template. `aug spec .` describes what the expression returns and which creation-time values it uses. Context packets distinguish a function-value dependency from an immediate call; later interface dispatch remains an explicit graph boundary.
