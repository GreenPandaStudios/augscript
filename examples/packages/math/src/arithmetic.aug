// aug-spec: "arithmetic.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right) :
    return left + right

test add:
    when addition:
        it adds_two_integers:
            assert(add(left=2, right=3) == 5)
