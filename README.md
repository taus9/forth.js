# Forth.js — A Minimal Forth Interpreter in JavaScript

![Tests](https://github.com/taus9/forth.js/actions/workflows/test.yml/badge.svg)

**Forth.js** is a small, lightweight interpreter for the Forth programming language written in modern JavaScript and designed to be run in-browser. You can checkout the [live demo](https://taus9.github.io/forth.js/demo/). 

---

## Features

* Implements a **basic Forth virtual machine** with:
  * Stack operations: `dup`, `drop`, `swap`, `over`, `nip`, `tuck`, ect. Full list can be found [here](https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack).
  * Arithmetic operations: `+`, `-`, `*`, `/`, `MOD`, `/MOD`, `1+`, `1-`
  * Colon definitions: Define or redefine words with `: ... ;`
  * 64-bit Cell width for the data stack
  * Comment handling

* Robust error handling:
  * `StackError`
  * `ParseError`
  * `OperationError`

* Extensible design:
  * Core words are modular and easy to extend
  * Supports easy addition of new Forth words

---

## Architecture & Development

### Word Definition & `this` Binding

Words are plain JavaScript functions stored in objects (see `forth/words/core.js` and `forth/words/dataStack.js`). When a word is executed, its callback is invoked with `this` bound to the `Fvm` instance:

```javascript
// Inside a word callback, 'this' is the Fvm instance
const myWord = {
  myWordName: function() {
    this.dataStack.push(42);  // Push to the VM's stack
  }
};
```

**Important:** Always use `this` to access the VM state (stack, status, etc.) rather than closing over a VM reference. This ensures consistency if the VM is reset or if multiple instances exist.

### Word Merging Order

The `Fvm` constructor merges words from multiple sources:

```javascript
this.words = {...words.core, ...words.dataStack}
```

Words from `words.dataStack` override any identically-named words from `words.core`. If you add a new word module, ensure it is exported from `forth/words/index.js` and merged in the desired order.

### Integer Clamping

Forth.js clamps arithmetic results that exceed safe integer bounds to `0`. This design choice reflects gForth behavior and prevents silent overflow to `Infinity`:

- Any operation result with absolute value > `Number.MAX_SAFE_INTEGER` (9007199254740991) is set to `0`
- Normal results within the safe integer range pass through unchanged

**Examples:**
- `2 3 **` → `8` (normal)
- `2 100 **` → `0` (exceeds safe bounds, clamped)

This approach prevents programs from accidentally working with very large exponents and keeps the VM semantics closer to traditional fixed-width Forth implementations.

### Potential Extensions

* Implement **control flow words** (`IF`, `ELSE`, `THEN`, loops)
* Support **return stack** for recursion and more advanced Forth features
* Full ANS Forth compilence 

---

## License

ISC License © Christopher R. Martinez


