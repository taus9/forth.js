# Copilot / AI Agent Instructions — forth.js

## Purpose
Help contributors and AI agents understand and modify this minimal Forth interpreter (browser-first ES modules with Node test support).

---

## Big Picture

**Core Runtime:**
- `Fvm` class in `src/forth.js` — stack-based VM with `execute(text)` entrypoint
- Two-pass execution: tokenize → process (supports multi-line colon definitions)
- State machine: `ForthState.INTERPRET` (default) and `ForthState.COMPILE` (inside `: ... ;`)

**Data Model:**
- All stack values are `Cell` objects (64-bit BigInt internally)
- `Cell` in `src/types/cell.js` provides `.toNumber()`, `.toSigned()`, `.toUnsigned()`
- dataStack contains Cell objects, not raw numbers

**Word System:**
- Built-in words live in `src/words/` (core.js, coreExt.js, misc.js)
- Words are plain JS functions: `callback.call(this)` where `this` is the Fvm instance
- Always use `this` to access VM state (never close over VM references)
- Words merged in constructor: `{...words.core, ...words.coreExt, ...words.misc}`

**Type System:**
- `src/types/types.js` - enums (ForthState, StatusTypes)
- `src/types/cell.js` - 64-bit cell wrapper around BigInt
- `src/types/words.js` - Word, NumberWord, InvalidWord classes

**Error Handling:**
- `src/errors/errors.js` - StackError, ParseError, OperationError
- On error: VM clears dataStack and throws typed error (tests rely on this)

---

## Architecture Patterns

### Execution Flow
```javascript
execute(text) {
  1. tokenize(text) → array of strings
  2. Loop through tokens:
     - Special handling for ':' (start compilation)
     - Special handling for ';' (finish compilation)
     - INTERPRET mode: parse and execute word
     - COMPILE mode: collect tokens into compilationBuffer
}
```

### Colon Definitions
```forth
: square dup * ;  ( define a word )
5 square          ( use it: 25 )
```
- `:` switches to COMPILE state, captures next token as word name
- Tokens between `:` and `;` stored in `compilationBuffer`
- `;` creates new word that re-executes the compiled tokens
- Compiled words stored in `this.words` (can override built-ins)

### Cell-Based Stack
```javascript
// Always push Cell objects
const c = new Cell(42);
this.dataStack.push(c);

// Access values
const top = this.dataStack.pop();
const num = top.toNumber();  // Convert to JS number
```

### Word Callbacks
```javascript
export const myWords = {
  'MYWORD': function() {
    this.checkStackUnderflow(1);  // Validate first
    const n = this.dataStack.pop();
    const result = new Cell(n.toNumber() * 2);
    this.dataStack.push(result);
  }
};
```

---

## File Structure

```
src/
├── forth.js          # Main VM (Fvm class)
├── types/
│   ├── types.js      # Enums (ForthState, StatusTypes)
│   ├── cell.js       # Cell class (64-bit BigInt wrapper)
│   └── words.js      # Word class hierarchy
├── words/
│   ├── core.js       # ANS Forth core words (+, -, *, /, MOD, etc.)
│   ├── coreExt.js    # Core extension words
│   ├── misc.js       # Utility words (., .s, stack ops)
│   └── index.js      # Exports all word modules
└── errors/
    └── errors.js     # Error types and messages

tests/
├── stack.test.js     # Data stack word tests
├── errors.test.js    # Error handling tests
├── compile.test.js   # Colon definition tests
└── run-node-tests.mjs # Test runner for npm test

demo/
├── index.html        # Browser UI
├── main.js           # UI logic, stack visualization
└── style.css         # Terminal styling
```

---

## Common Tasks

### Add a New Word
1. Add to appropriate file in `src/words/`:
```javascript
// src/words/core.js
export const core = {
  // ...
  'NEGATE': function() {
    this.checkStackUnderflow(1);
    const n = this.dataStack.pop();
    this.dataStack.push(new Cell(-n.toNumber()));
  }
};
```

2. Ensure exported in `src/words/index.js`
3. Word automatically available (merged in Fvm constructor)

### Add Tests
```javascript
// tests/stack.test.js
this.test('NEGATE flips sign', () => {
  const fvm = new Fvm();
  fvm.execute('5 NEGATE');
  this.expectStack(fvm, [-5]);  // expectStack uses toNumber()
});
```

### Handle Errors
```javascript
if (condition) {
  this.reset();  // Clears stack
  throw new errors.OperationError(errors.ErrorMessages.SOME_ERROR);
}
```

---

## Development Workflow

### Local Testing
```bash
# Run all tests
npm test

# Or run individual test files
node tests/stack.test.js
node tests/errors.test.js
node tests/compile.test.js
```

### Browser Demo
```bash
# Start local server
python3 -m http.server
# or
npx http-server

# Open http://localhost:8000/demo/
```

**Demo Features:**
- Examples sidebar (clickable commands)
- Real-time stack visualization
- Test suite runner button
- Dev mode indicator (shows on localhost)

### CI/CD
- GitHub Actions runs `npm test` on push/PR
- Tests run on Node 18.x and 20.x
- Badge in README shows test status

---

## Important Conventions

### Stack Operations
```javascript
// ALWAYS check before popping
this.checkStackUnderflow(2);  // Need 2 items

// ALWAYS push Cell objects
this.dataStack.push(new Cell(value));

// Access via toNumber() for arithmetic
const n = this.dataStack[0].toNumber();
```

### Division Semantics
Forth uses **floored division** (rounds toward negative infinity):
```javascript
// Wrong: a / b (truncates toward zero)
// Right:
const quotient = a / b;
const floored = quotient < 0 && a % b !== 0 ? quotient - 1 : quotient;
```

### Error Clearing
```javascript
// Pattern used throughout:
if (error_condition) {
  this.reset();  // Clears dataStack, compilationBuffer, resets state
  throw new errors.SomeError(message);
}
```

### Word Naming
- Forth words are case-insensitive (stored uppercase internally)
- Use uppercase keys in word objects: `'DUP'`, `'SWAP'`, etc.
- Operators can be any case: `'+'`, `'*'`, `'MOD'`

---

## Testing Patterns

### Test Structure
```javascript
expectStack(fvm, expected) {
  // Maps Cell objects to numbers for comparison
  const actualValues = fvm.dataStack.map(cell => cell.toNumber());
  // Compare against plain number array
}

this.test('description', () => {
  const fvm = new Fvm();
  fvm.execute('5 3 +');
  this.expectStack(fvm, [8]);
});
```

### Error Testing
```javascript
this.expectError(
  () => fvm.execute('drop'),  // Empty stack
  errors.ErrorTypes.STACK,
  'Stack underflow'           // Optional message check
);
```

---

## State Machine Details

### INTERPRET Mode (default)
- Parses each token
- Numbers → push Cell to dataStack
- Words → execute immediately
- Invalid words → throw ParseError

### COMPILE Mode (between `:` and `;`)
- Triggered by `:` token
- Captures next token as word name
- Collects all subsequent tokens in `compilationBuffer`
- `;` ends compilation, creates word function
- Compiled word re-executes buffered tokens via `execute()`

### Compilation Example
```forth
: DOUBLE 2 * ;
```
Results in:
```javascript
this.words['DOUBLE'] = function() {
  this.execute('2 *');  // Re-executes the definition
};
```

---

## Performance & Design Choices

### Cell vs Number Trade-offs
- **Pros:** Predictable 64-bit semantics, correct Forth overflow, bitwise ops
- **Cons:** Memory overhead, conversion cost for arithmetic
- **Design:** Prioritizes correctness over raw performance

### Two-Pass Tokenization
- **Why:** Allows `:` to peek ahead for word name
- **Cost:** Extra iteration over input
- **Benefit:** Clean separation of lexing and execution

### String-Based Compilation
- **Current:** Store tokens as strings, re-parse on execution
- **Alternative:** Store parsed Word objects (faster, more complex)
- **Decision:** Simplicity first, optimize later if needed

---

## Integration Points

### Demo UI (`demo/main.js`)
- Imports `Fvm`, test suites
- Expects `fvm.output` for `.` word output
- Expects `fvm.dataStack` as array of Cells
- Updates stack visualization on every execution
- Localhost detection for dev mode banner

### Test Suites
- Use `expectStack(fvm, [numbers])` helper
- Expect errors to clear stack
- Check `fvm.output` for printing words
- All tests must pass for CI

---

## Future Extensions (Not Implemented)

- Control flow: IF/THEN/ELSE/DO/LOOP
- Return stack operations
- Memory operations (@, !)
- Immediate words
- Recursive word definitions
- DOES> semantics

---

## Questions for Contributors

**Before adding features:**
- Does this belong in core.js, coreExt.js, or misc.js?
- Do I need new error types?
- Are there test cases covering edge cases?
- Does this work with multi-line input (compilation)?

**When in doubt:**
- Check existing word implementations for patterns
- Run `npm test` after changes
- Test in demo UI with examples sidebar
- Look at ANS Forth spec: https://forth-standard.org/

---

## Common Gotchas

1. **Forgot to import Cell:** `import { Cell } from './types/cell.js'`
2. **Pushed numbers instead of Cells:** Always `new Cell(value)`
3. **Used `this.dataStack[0]` directly:** Need `.toNumber()` for arithmetic
4. **Division uses `/` instead of floored division:** See division semantics above
5. **Didn't check stack before popping:** Always `this.checkStackUnderflow(n)` first
6. **Closed over VM instead of using `this`:** Word callbacks must use `this`
7. **Mixed case word names:** Store as uppercase internally

---

If anything is unclear, check:
1. README.md for user-facing documentation
2. Existing word implementations for patterns
3. Test files for expected behavior
4. ANS Forth standard for correct semantics
