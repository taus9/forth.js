# Forth.js — A Minimal Forth Interpreter in JavaScript

**Forth.js** is a small, lightweight interpreter for the Forth programming language written in modern JavaScript and designed to be run in-browser.

---

## Features

* Implements a **basic Forth virtual machine** with:
  * Stack operations: `dup`, `drop`, `swap`, `over`, `nip`, `tuck`, ect. Full list can be found [here](https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack)  
  * Arithmetic operations: `+`, `-`, `*`, `/`, `**`, `%`
  * Number literals and parsing
  * Comment handling aligned with gforth conventions

* Robust error handling:
  * `StackError` for underflow
  * `ParseError` for invalid words
  * `OperationError` for invalid math operations

* Extensible design:
  * Core words are modular and easy to extend
  * Supports easy addition of new Forth words

---

## Key Learnings & Skills Demonstrated

* Designing and implementing a **stack-based virtual machine**
* Writing **token parsers and interpreters**
* Managing **error handling** in a low-level runtime
* Working with **modular JavaScript** and clean project structure
* Understanding **Forth language semantics** (stack ops, arithmetic, comments)

---

## Potential Extensions

* Add **colon definitions (`:` ... `;`)** to define new words
* Implement **control flow words** (`IF`, `ELSE`, `THEN`, loops)
* Add **unit tests** for all built-in words and error cases
* Support **return stack** for recursion and more advanced Forth features

---

## License

ISC License © Christopher R. Martinez


