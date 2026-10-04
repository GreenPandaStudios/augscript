// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logger
import ConsoleLogger from console
import Greeter from greeter
import increment from math
implement Logger with ConsoleLogger
greeter = Greeter(x=4)
greeter.greet(name="AugScript")
int count = 7
count = increment(value=count)
print(value=count)
