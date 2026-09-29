import Console and SystemConsole from august.io
import Application and ApplicationImpl and Fruit and double and RangeError from domain
import Counter and Counters from counters
implement Console with SystemConsole
implement Application with ApplicationImpl
include Counters
resolve Application to app
app.start()
names to {1: "apple", 2: "pear"}
match names.get(key=2):
	when null:
		print(value="missing fruit")
	when some name:
		print(value=name)
(code, label) to (3, "plum")
print(value={Fruit(code=code, name=label), Fruit(name=label, code=code)}.length())
scope:
	resolve Counter to counter
	borrow counter:
		counter.increment()
	print(value=counter.value())
try:
	print(value=double(amount=7))
	double(amount=-1)
catch RangeError error:
	print(value="negative amount rejected")
