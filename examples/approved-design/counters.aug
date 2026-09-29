/** Reading state has no mutation effect. */
interface State:
	read() returns int
_Initial() implements State:
	read() returns int:
		return 0
_Updated(int count) implements State:
	read() returns int:
		return count
/** A mutable counter with an explicit transition contract. */
interface Counter:
	increment() changes self
	value() returns int
_Counter(resolve mutable State initial to _state) implements Counter:
	increment() changes self:
		_state to _Updated(count=_state.read() + 1)
	value() returns int:
		return _state.read()
/** The complete counter composition; its mutable state belongs to each scope. */
composition Counters:
	implement State with _Initial
	implement Counter with _Counter scoped mutable
