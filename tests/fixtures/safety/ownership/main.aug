import read from operations

scope:
    own Shared<List<int>> state = Shared(value=[1, 2])
    pending = start read(state=state)
    print(value=wait for pending)
print(value="released")
