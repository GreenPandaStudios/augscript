// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Permission to write to a console, provided by an explicitly selected adapter. */
capability Console:
    /** Write one line of text. @param value Text to display. */
    write<T>(T value) uses Console.write

/** The native standard-output adapter. Construction performs no output. */
SystemConsole() implements Console:
    write<T>(T value):
        print(value=value)

/** Read UTF-8 text through an explicitly selected filesystem adapter. */
capability FileReader:
    /** Read text. @param path File path. @throws FileError The file could not be read. */
    read(string path) returns string uses FileReader.read unless FileError

/** Write UTF-8 text through an explicitly selected filesystem adapter. */
capability FileWriter:
    /** Write text. @param path File path. @param content Text. @throws FileError Writing failed. */
    write(string path, string content) uses FileWriter.write unless FileError

/** Native files. Operations are explicit; construction opens no files. */
LocalFiles() implements FileReader, FileWriter:
    read(string path) returns string unless FileError:
        return read_file(path=path)
    write(string path, string content) unless FileError:
        write_file(path=path, content=content)

/** Read command-line input through an explicit dependency. */
capability Arguments:
    read() returns List<string> uses Arguments.read

/** Native command-line arguments. */
ProcessArguments() implements Arguments:
    read() returns List<string>:
        return arguments()
