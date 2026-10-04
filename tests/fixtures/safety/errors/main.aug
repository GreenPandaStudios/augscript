import divide and first from operations

try:
    print(value=divide(left=7, right=0))
catch ArithmeticError error:
    print(value="caught arithmetic")
always:
    print(value="arithmetic cleanup")

try:
    print(value=first(values=[]))
catch IndexError error:
    print(value="caught index")
always:
    print(value="index cleanup")
