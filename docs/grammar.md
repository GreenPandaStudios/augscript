# Grammar and line boundaries

This is the compact accepted grammar for 0.21. `Name` is an identifier, and bracketed grammar groups below are optional. These text blocks describe syntax rather than executable snippets.

## Blocks and declarations

```text
Block       := "{" Statements "}"
             | ":" NEWLINE INDENT Statements DEDENT

Function    := [Tags] ["fixture"] Name [Generics] "(" Parameters ")"
               ["returns" ["own"] Type] ["changes" Paths]
               ["uses" Paths] ["unless" Types] (Block | End)

Class       := [Tags] Name [Generics] ["(" Fields ")"]
               ["unless" Types] "implements" Type {"," Type} ClassBlock
ClassBlock  := BlockOfFieldsAndMethodsWithOptionalInitialize
Initialize  := "initialize" Block

Record      := "record" Name [Generics] "(" Fields ")"
               ["unless" Types] [BlockOfInitialize]

Interface   := ("interface" | "capability") Name [Generics]
               ["extends" Type {"," Type}] Block

Interceptor := "interceptor" Name [Generics] ["(" ResolveFields ")"] Block
Composition := "composition" Name BlockOfBindings
Endpoint    := [Tags] "endpoint" HttpMethod String "as" Name "(" Parameters ")"
               ["returns" Type | "streams" Type] ["uses" Paths]
               ["unless" Type ["with status" Integer] {"and" Type ["with status" Integer]}]
               ["with status" Integer] Block
```

An interface/class/interceptor block contains method declarations. A record ends after its header or validation block and has no behavior body. An executable body infers an absent returns clause; no returned value means void. A bodyless signature defaults to void. Omitted changes, uses, and unless clauses are inferred from executable bodies; explicit clauses remain checked bounds. Its body is required for calls, except extern C. There is no class or function prefix.

The implements clause identifies a class. Its initialize block appears inside the class before methods, and runs after field initialization. Records can contain one initialize block for validation. Nested function declarations are not supported. A root `counter()` statement is a call, not a declaration.

```text
Generics    := "<" Generic {"," Generic} ">"
Generic     := ["in" | "out"] Name ["implements" Type {"and" Type}]
Type        := ["optional"] Name ["<" Types ">"]
Parameter   := ["resolve"] ["mutable"] ["own" | "borrow"] Type Label ["to" Storage]
               ["from" WireSource [String]]
Types       := Type {("and" | ",") Type}
Paths       := Path {("and" | ",") Path}
Tags        := {"[" Name ["<" Types ">"] ["(" Mappings ")"] "]"}
Mapping     := AroundLabel ("=" | "to") TargetLabel
PolicyOption := Name ("=" | "to") (TargetLabel | Literal | ListOfStringLiterals)
```

Variance is accepted only on interfaces; mutable storage applies to class headers. Resolve cannot be combined with own/borrow. General parameters still use Type name order. Public labels and private storage are explicit in headers.

## Imports, bindings, and calls

```text
Import      := "import" (Name {"and" Name} | "everything") "from" (DottedPath | RepositoryUrl {"." Name}) End
Export      := "export" Name "from" SiblingName End
             | "export" "folder" ChildName End
Binding     := "implement" Key ["<" Types ">"] "with" Type
               ["shared" | "fresh" | "scoped"] ["mutable"] End
Include     := "include" Name End
CallInput   := Label ("=" | "to") Expression | Name
Assignment  := [["own" | "borrow"] Type] Target ("=" | "to") Expression End
Resolve     := "resolve" Key ["<" Types ">"] "to" Name End
```

A quoted public repository URL declares a source dependency. A URL can select a tag or commit with #REVISION. See [packages](packages.md) for aliases and commit locks.

The formatter uses implement/with and resolve/to, and preserves wildcard imports. Assignment style remains a project preference. Repeated paths/errors can use and or comma; canonical error clauses use and. Collection constructor elements are positional because their order carries meaning. Assert also accepts its single bool positionally.

## Control flow and tests

```text
Statement   := Assignment | Expression End | "pass" End
             | "return" [Expression] End | "throw" Expression End
             | "if" Expression Block ["else" (Block | If)]
             | "while" Expression Block
             | "for" Pattern "in" Expression Block
             | Pattern ("=" | "to") Expression End
             | "match" Expression BlockOfCases
             | "try" Block {"catch" Type Name Block}
               ["always" Block]
             | "borrow" Name Block | "unsafe" Block | "scope" Block
             | "lock" Expression "as" Name Block
             | "freeze" Expression "as" Name End
             | "yield" Expression End
             | "serve" Name {"and" Name} "on port" Expression End

Pattern     := Name | "(" Name {"," Name} [","] ")"
MatchCase   := "when" ("null" | "some" Name | "true" | "false" | Type Name) Block
             | "else" Block

Test        := "test" LocalFunction BlockOfGroups
             | "test" LocalClassType SubjectName BlockOfGroups
             | "test endpoint" LocalEndpoint ClientName BlockOfGroups
Group       := "when" TestName BlockOfSetupAndCases
Case        := "it" TestName ["for" Pattern "in" ListOfTupleRows] Block
TestName    := Identifier | String
```

Setup bindings precede setup statements, which precede cases. Empty bodies use pass. Includes are composition/setup operations; declarations and setup ordering are checked beyond parsing.

Optional values have two cases: null and some. Omitted inputs become null. Type? and missing are obsolete spellings; use optional Type and null. Old matches with separate missing and null branches require one merged null branch.

## Expressions and ambiguity

| Spelling | Meaning |
| --- | --- |
| `[a, b]` | List literal. |
| `(a, b)`, `(a,)`, `()` | Tuple literals. |
| `(a)` | Grouping. |
| `{a, b}` | Set literal. |
| `{key: value}` | Map literal. |
| `{}` | Empty Set or Map determined by context. |
| `[Validator] header...` | Interceptor annotation on a declaration. |
| `receiver.member(label=value)` | Labeled method call. |
| `receiver.member(value)` | Same-name label shorthand when value is a name. |
| `start load(input=value)` | A scope-owned task. |
| `wait for first and second` | Ordered task results. |
| `wait for tasks` | Ordered collection of results. |
| `handle save(input from form)` | A checked deferred HTTP form action. |
| `<Panel title={name}>...</Panel>` | Checked server component producing Html. |

Operators from high to low precedence: member/call, unary minus, multiplication/division, addition/subtraction, ordered comparisons, equality, not, and, or. Thus `not count == 0` means `not (count == 0)`. Boolean operations short-circuit from left to right. Only the word spellings are accepted; `&&`, `||`, and unary `!` are syntax errors. `!=` remains accepted. Binary operators associate left. No assignment expression or implicit truthiness is supported. Exponentiation, remainder, and implicit casts are absent.

Function contract clauses may appear in any order, once each; the formatter writes returns, changes, uses, then unless. Storage aliases apply to class/record/interceptor fields rather than ordinary function parameters.

## Newlines, indentation, and comments

- A newline outside delimiters ends a complete statement. EOF and a closing block brace also end it; semicolons may separate same-line statements.
- An unfinished operator continues onto the next line. Parentheses, lists, tuples, sets, and maps continue until their matching delimiter.
- A leading operator or call parenthesis on a new line begins a new statement.
- A colon for a block is followed by a newline and increased indentation. A colon inside a Map literal separates key/value and creates no indentation block.
- Tabs and spaces are both valid. Mixed characters in one prefix, inconsistent sibling levels, extra unrequested indentation, or a dedent that matches no ancestor are errors.
- Blank lines and comment-only lines do not alter indentation. // line comments and /* block comments */ are supported.
- Return expressions begin on the return line; use parentheses to continue one.

The parser owns these rules. The formatter reparses and compares program structure before offering an edit, preserving comments while choosing the project's block and assignment styles.
