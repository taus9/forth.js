# Forth.js — A Minimal Forth Interpreter in JavaScript

![Tests](https://github.com/taus9/forth.js/actions/workflows/test.yml/badge.svg)

**Forth.js** is a minimal interpreter for the Forth programming language written in modern JavaScript and designed to be run in-browser. You can checkout the [live demo](https://taus9.github.io/forth.js/demo/). 

---

## Features

* Implements a **basic Forth virtual machine** with:
  * Stack operations: `DUP`, `DROP`, `SWAP`, `OVER`, `NIP`, `TUCK`, ect. Full list can be found [here](https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack).
  * Arithmetic operations: `+`, `-`, `*`, `/`, `MOD`, `/MOD`, `1+`, `1-`, `ABS`, `MIN`, `MAX`, `NEGATE`
  * Colon definitions: Define or redefine words with `: ... ;`
  * Branching: `IF`, `ELSE`, `THEN`
  * Looping: `DO`, `LOOP`, `+LOOP`, `LEAVE`, `I`, `J`, `UNLOOP`, `WHILE`, `REPEAT`
  * String output: `."` (dot-quote) for printing strings
  * 64-bit Cell width for the data stack
  * Comment handling

* Robust error handling:
  * `StackError`
  * `ParseError`
  * `OperationError`
  * `InterpreterError`

* Extensible design:
  * Core words are modular and easy to extend
  * Supports easy addition of new Forth words

---

## Architecture & Development

### Word Definition & `this` Binding

Words are plain JavaScript functions stored in objects (see `forth/words/core.js`, `forth/words/core-ext.js`, ect). When a word is executed, its callback is invoked with `this` bound to the `Fvm` instance:

```javascript
// src/words/example.js
import { Cell } from '../types/cell.js';

// Inside a word callback, 'this' is the Fvm instance
export const myWords = {
  myWordName: function() {
    const u = new Cell(42); // Only push Cell objects on to the dataStack
    this.dataStack.push(u);  // Push to the VM's stack
  }
};

// src/words/index.js
// Add file to index.js export 
import { myWords } from './examples.js';

export (
  // ... ,
  myWords
)

// src/forth.js
export class Fvm {
  constructor() {
    // ...
    this.words = {
      ...words.core, 
      ...words.coreExt, 
      ...words.misc,
      ...words.myWords
      }
  }

  // don't forget to add your words to resetWords()
  resetWords() {
    this.words = {
      ...words.core, 
      ...words.coreExt, 
      ...words.misc,
      ...words.myWords
    }
  }
}
```

**Important:** Always use `this` to access the VM state (stack, status, etc.) rather than closing over a VM reference. This ensures consistency if the VM is reset or if multiple instances exist.

### Word Merging Order

The `Fvm` constructor merges words from multiple sources:

```javascript
this.words = {...words.core, ...words.coreExt, ...}
```

Words from `words.core` override any identically-named words from `words.coreExt` and so on. If you add a new word module, ensure it is exported from `forth/words/index.js` and merged in the desired order.

### 64-bit Cells vs JavaScript Numbers

Forth.js uses **64-bit cells** stored as JavaScript `BigInt` values to represent data on the stack, matching traditional Forth implementations. This differs from JavaScript's native 53-bit safe integer precision and has important implications:

**Why Cells?**
- ANS Forth specifies that all stack values are stored as fixed-width cells (32-bit or 64-bit)
- Forth.js chooses 64-bit cells for broader numeric range while maintaining predictable overflow behavior
- Using `BigInt` ensures consistent two's complement arithmetic and bit operations

**Key Differences from JavaScript Numbers:**
- JavaScript numbers use IEEE 754 double-precision (53-bit integer precision)
- Forth cells use full 64-bit unsigned integers internally with signed/unsigned interpretation
- Operations exceeding 64-bit range wrap around (modular arithmetic) rather than becoming `Infinity`

**Implementation Details:**
```javascript
// All stack values are Cell objects
import { Cell } from './types/cell.js';

const c = new Cell(42);
c.toNumber()    // → 42 (convert to JavaScript number)
c.toSigned()    // → 42n (as signed BigInt)
c.toUnsigned()  // → 42n (as unsigned BigInt)
```

This design prioritizes Forth compatibility and predictable semantics over raw JavaScript performance.

### String Output with `."` (Dot-Quote)

The `."` word prints string literals to the console output. It follows ANS Forth standards for string handling:

**Syntax:** `." text-until-quote"`

**Examples:**
```forth
." Hello, World!"              ( prints: Hello, World! )

: greet ." Hello, " ." Forth!" ;
greet                          ( prints: Hello, Forth! )

: show-result ." Answer: " . ;
42 show-result                 ( prints: Answer: 42 )
```

**Behavior:**
- In **interpret mode**: Immediately outputs the string
- In **compile mode**: Compiles the string into the word definition
- The space after `."` is treated as a delimiter and is skipped
- String extends until the closing `"` character
- Does not affect the data stack

### Potential Extensions

* Implement **looping words** (`BEGIN`, `UNTIL`, `WHILE`, `REPEAT`)
* Support **return stack** for recursion and more advanced Forth features
* Full ANS Forth compilence 

---

## License

ISC License © Christopher R. Martinez


