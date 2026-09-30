// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface ICounter {
    label() returns string
}
Counter(mutable int value) implements ICounter {
    _label() {
        return _prefix()
    }
    label() {
        return self._label()
    }
}
_prefix() {
    return "count"
}
