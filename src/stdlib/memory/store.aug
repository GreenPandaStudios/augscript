// aug-spec: "store.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** The bounded store could not accept another live entry. */
StoreFull() implements Error:
    pass
record _Entry<T implements Data>(T value, int expires)

/** A bounded, expiring capability for immutable values. Each generic DI binding has its own table. */
capability ExpiringStore<T implements Data>:
    /** Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. */
    put(string key, T value, int expires, int now) uses ExpiringStore.put unless StoreFull
    /** Atomically remove a value. Expired or absent entries return null. */
    take(string key, int now) returns optional T uses ExpiringStore.take
    /** Read a live value without consuming it. */
    get(string key, int now) returns optional T uses ExpiringStore.get

/** A synchronized table with short critical sections and no I/O while locked. */
MemoryStore<T implements Data>() implements ExpiringStore<T>:
    Shared<Map<string, _Entry<T>>> _entries = Shared(value=Map<string, _Entry<T>>())
    put(string key, T value, int expires, int now) :
        entry = _Entry<T>(value=value, expires=expires)
        lock _entries as entries:
            for (name, saved) in entries:
                if saved.expires <= now:
                    entries.take(key=name)
            if entries.length() >= 512 and not entries.contains(key=key):
                throw StoreFull()
            entries.set(key=key, value=entry)
    take(string key, int now) returns optional T:
        lock _entries as entries:
            match entries.take(key=key):
                when null:
                    return null
                when some saved:
                    if saved.expires <= now:
                        return null
                    return saved.value
    get(string key, int now) returns optional T:
        lock _entries as entries:
            match entries.get(key=key):
                when null:
                    return null
                when some saved:
                    if saved.expires <= now:
                        return null
                    return saved.value
