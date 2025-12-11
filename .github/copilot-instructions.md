# Copilot / AI Agent Instructions — forth.js

Guide contributors and AI agents working on forth.js, a browser-first ES module implementation of a minimal ANS Forth interpreter with Node-based tests and a demo UI.

## Big Picture
- `Fvm` in `src/forth.js` orchestrates tokenization, interpretation, compilation, and error reporting. `execute(code)` accepts either source text or an array of `Word` instances.
- Built-in words live under `src/words/` (`core.js`, `core-ext.js`, `misc.js`) and are merged into `this.words` during construction.
- `ForthMemory` in `src/memory.js` backs `VARIABLE`, `@`, and `!` with 64-bit addresses.
- Tests in `tests/*.test.js` cover arithmetic, stack discipline, control flow, memory semantics, and error propagation.
- Browser demo (`demo/`) and Node REPL (`repl.js`) provide interactive front-ends for experimentation.

---

## Runtime Data Structures
- `dataStack`: operand stack of `Cell` instances.
- `returnStack`: loop metadata (indices, limits, exit targets) plus BEGIN/WHILE bookmarks. Always pop what you push, even on LEAVE/EXIT paths.
- `controlStack`: compile-time bookkeeping for IF/ELSE/THEN, DO/LOOP, BEGIN/WHILE/REPEAT, etc.
- `executionStack`: frames pushed by `execute`, each holding `{ words, index }` for nested colon definitions.
- `compilationBuffer`: collects pre-parsed `Word` instances while compiling between `:` and `;`.
- `memory`: `ForthMemory` instance that maps 64-bit addresses to `Cell` values.

---

## Word Types & Flags
- `Word` wraps a callback plus flags from `types.FlagTypes` (`IMMEDIATE`, `COMPILE_ONLY`, `DEFINING_WORD`).
- `NumberWord` stores numeric literals alongside the ready-to-push `Cell`.
- `TextWord` marks unresolved identifiers and triggers a `ParseError` in interpret mode.
- `CompileWord` exists for future work; tokenization currently yields only `Word`, `NumberWord`, and `TextWord`.
- All callbacks run with `this` bound to the active `Fvm`; never close over a VM instance.
- Definitions in `src/words/*` follow `{ flags, entry }`; the parser wraps them into `Word` objects on demand.

---

## Execution Flow
1. `tokenize(text)` strips whitespace, ignores `( ... )` comments, uppercases tokens, and maps them to the appropriate word type.
2. `execute(code)` pushes a frame on `executionStack` and iterates until the frame drains.
3. In `COMPILE` state, tokens append to `compilationBuffer` unless flagged `IMMEDIATE`; compile-only misuse raises an `InterpreterError`.
4. In `INTERPRET` state, `NumberWord` pushes to `dataStack`, `Word` invokes its callback, and `TextWord` throws a `ParseError`.
5. After the frame finishes, status becomes `OK` (interpret) or `COMPILED` (still inside a definition).

---

## Compilation & Colon Definitions
- `:` (`DEFINING_WORD`) switches to compile mode, consumes the next token as the name, clears `compilationBuffer`, and stores it in `this.compilingWord`.
- `;` (`IMMEDIATE`, `COMPILE_ONLY`) verifies `controlStack` is empty, installs the compiled word into `this.words`, writes `redefined <name>` to `output` when overriding, and restores interpret mode.
- Colon definitions replay the captured `Word` array directly—no re-tokenization during execution.
---

## Control Flow
- Compile-time words (`IF`, `ELSE`, `THEN`, `DO`, `LOOP`, `+LOOP`, `LEAVE`, `BEGIN`, `WHILE`, `REPEAT`, `UNTIL`, `EXIT`, `UNLOOP`) manage `controlStack` and emit runtime helpers in parentheses.
- Runtime helpers use `returnStack`:
  - `(DO)` seeds loop frames and skips zero-iteration ranges.
  - `(LOOP)`/`(+LOOP)` update indices and either recycle the loop or pop when finished.
  - `(LEAVE)` jumps to the stored exit index.
  - `(BEGIN)` records the restart position; `(UNTIL)` and `(WHILE)` inspect the flag and either continue or unwind.
  - `(REPEAT)` jumps back to the `(BEGIN)` bookmark when `WHILE` succeeds.
  - `(UNLOOP)` pops loop metadata on early exits.
  - `I`/`J` expose current and outer loop indices.
- Imbalanced `returnStack` usage raises `RETURN_STACK_UNDERFLOW`—keep helpers paired.

---

## Memory & Variables
- `ForthMemory` allocates 64-bit addresses (0 reserved) and stores `Cell` values.
- `VARIABLE` allocates an address via `memory.allocate()` and defines a word that pushes it.
- `@` and `!` read and store `Cell` values; invalid addresses raise `OperationError`.

---

## Error Handling
- Guard pops with `this.checkStackUnderflow(n)`; it calls `errorReset()` and throws `StackError` on failure.
- Prefer `errorReset()` when surfacing interpreter or parse errors so user-defined words survive.
- Reserve `resetFVM()` for catastrophic faults (e.g., divide-by-zero) when the dictionary and memory must reset.
- Error classes and shared messages live in `src/errors/errors.js`.

---

## File Structure

```
src/
├── forth.js          # VM, tokenizer, execution loop, status management
├── memory.js         # ForthMemory allocator and validation
├── types/
│   ├── types.js      # StatusTypes, ForthState, FlagTypes
│   ├── cell.js       # 64-bit Cell wrapper with signed/unsigned helpers
│   └── words.js      # Word, NumberWord, TextWord (CompileWord scaffold)
├── words/
│   ├── core.js       # Core words, control flow, variables, memory access
│   ├── core-ext.js   # Extended stack/comparison words
│   ├── misc.js       # Utility words (.S, multi-slot stack ops)
│   └── index.js      # Aggregated exports
tests/
├── words.test.js     # Arithmetic and stack tests
├── errors.test.js    # Error propagation and stack clearing
├── compile.test.js   # Control-flow and colon-definition coverage
└── run-node-tests.mjs # Harness for npm test
demo/
├── index.html        # Browser demo shell
├── main.js           # UI logic and stack visualisation
└── style.css         # Terminal styling
repl.js               # Node REPL entry point
```

---

## Testing & Tooling
- Run `npm test` for the full suite or execute individual files with `node tests/<file>.test.js`.
- Serve `demo/` via `python3 -m http.server` (or `npx http-server`) and open `/demo/` in a browser.
- Use `npm run repl` or `node repl.js` for the interactive REPL (`@help`, `@stack`, `@words`, `@reset`, `@exit`).

---

## Future Extensions (Not Implemented)
- Advanced control structures (`CASE`/`OF`, nested LEAVE variants, DOES> semantics).
- Return-stack transfer words (`>R`, `R>`, `R@`) and richer memory primitives.
- Persistent dictionary snapshots or module loading.
- Performance work: tail-call elimination, caching compiled frames.

---

## Quick Reference Checklist
- Push and pop only `Cell` instances.
- Choose `errorReset()` vs `resetFVM()` deliberately.
- Keep `controlStack` and `returnStack` in sync when generating helper words.
- Make redefining words announce themselves via `this.output` when appropriate.

