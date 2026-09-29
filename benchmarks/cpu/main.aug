// A loop-carried dependency prevents removal of the computation.
int state = 123
int index = 0
while index < 2000000:
    int product = state * 48271
    state = product - (product / 2147483647) * 2147483647
    index = index + 1
print(value=state)
