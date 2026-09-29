import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging
import ConsoleLogger from logging
import Greeter from app
import describe from app
import ValidationError from interceptors
implement Logger with ConsoleLogger
try {
    print(value=describe(label="value", x=6))
}
catch ValidationError error {
    print(value="rejected")
}
greeter = Greeter(name="AugScript")
print(value=greeter.greet())
try {
    describe(x=-1, label="invalid")
}
catch ValidationError error {
    print(value="rejected")
}
