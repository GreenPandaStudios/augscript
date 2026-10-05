read(own Shared<List<int>> state) returns int changes state:
    lock state as values:
        return values.length()
