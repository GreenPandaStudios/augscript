// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Fruit from models
/** The application's explicit startup operation. */
interface Application:
	/** Writes the fruit names through the selected console. */
	start() uses Console.write
/** Construction stores dependencies; start performs the visible external work. */
ApplicationImpl(resolve Console console) implements Application:
	start() :
		fruit to [Fruit(code=1, name="apple"), Fruit(name="pear", code=2)]
		for item in fruit:
			console.write(value=item.name)
