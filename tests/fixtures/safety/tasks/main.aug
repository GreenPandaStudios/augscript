import length and fail from operations

items = [1, 2]
scope:
    first = start length(values=items)
    second = start length(values=items)
    wait for first and second to a and b
    print(value=a + b)
    borrow items:
        items.append(value=3)
    pending = [start length(values=items), start length(values=items)]
    results = wait for pending
    for result in results:
        print(value=result)

try:
    scope:
        failure = start fail()
        print(value=wait for failure)
catch FileError error:
    print(value="caught task error")
