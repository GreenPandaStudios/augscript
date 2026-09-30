// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** An explicit clock dependency makes time-based behavior replaceable in tests. */
capability Clock:
    /** Read whole Unix seconds in UTC. */
    now() returns int uses Clock.now unless TimeError
extern C value _aug_time_now() returns int uses Clock.now unless TimeError
/** Operating-system wall clock. */
SystemClock() implements Clock:
    now() returns int unless TimeError:
        unsafe:
            return _aug_time_now()
