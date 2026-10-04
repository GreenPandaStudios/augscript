import Person from data
import parse from json

try:
    person = parse(input="{\"name\":\"Ada\",\"age\":null}").decode<Person>()
    print(value=person.name)
    print(value=person.age == null)
    invalid = parse(input="{").decode<Person>()
    print(value=invalid.name)
catch JsonError error:
    print(value="caught json error")
