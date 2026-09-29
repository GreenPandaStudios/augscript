try {
    numbers = List<int>(2, 4)
    borrow numbers {
        numbers.append(value=6)
    }
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores {
        scores.set(value=42, key="ada")
    }
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
}
catch IndexError error {
    print(value="unexpected index failure")
}
