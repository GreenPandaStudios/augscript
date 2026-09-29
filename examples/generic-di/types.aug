import Console from august.io
interface Repository<T> {
    get() returns T
}
NumberRepository() implements Repository<int> {
    get() returns int {
        return 7
    }
}
Program(resolve Repository<int> repository) implements IProgram {
    start(resolve Console console) uses Console.write {
        console.write(value=repository.get())
    }
}
interface IProgram {
    start(resolve Console console) uses Console.write
}
