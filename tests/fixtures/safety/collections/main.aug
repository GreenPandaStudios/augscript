try:
    Map<int, int> entries = {}
    Set<int> seen = {}
    List<int> items = [1, 2, 3]
    int round = 0
    while round < 64:
        int key = 0
        while key < 31:
            borrow entries:
                entries.set(key=key, value=round)
            borrow seen:
                seen.add(value=key)
            key = key + 1
        round = round + 1
    print(value=entries.length())
    print(value=entries.get(key=0))
    print(value=seen.length())
    for value in items:
        borrow items:
            items.append(value=value + 10)
    print(value=items.length())
    print(value=items.get(index=4))
    int total = 0
    for (key, value) in entries:
        borrow entries:
            match entries.take(key=key):
                when null:
                    pass
                when some removed:
                    total = total + value + removed
    print(value=entries.length())
    print(value=total)
catch IndexError error:
    print(value="unexpected index error")
