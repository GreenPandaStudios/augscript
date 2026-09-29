import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging
import ConsoleLogger from logging
import Greeter from app
implement Logger with ConsoleLogger
implement app with Greeter
resolve app to greeter
greeter.greet(name="AugScript")
