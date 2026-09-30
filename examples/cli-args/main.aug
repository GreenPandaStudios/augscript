// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
try {
    args = arguments()
    print(value=args.length())
    if args.length() > 0 {
        print(value=args.get(index=0))
    }
    numbers = List<int>(1, 2)
    borrow numbers {
        numbers.append(value=3)
    }
    print(value=numbers.get(index=2))
}
catch IndexError error {
    print(value="unexpected index failure")
}
