# Copilot / AI Agent Instructions — forth.js

Purpose
- Help contributors and AI agents quickly understand and modify this minimal Forth interpreter (in-browser ES modules).

Big picture (what to know first)
- The runtime is the `Fvm` class in `forth/forth.js` — a small stack-based virtual machine with an `execute(text)` entrypoint.
- Built-in words (commands) live under `forth/words/` and are exported via `forth/words/index.js`. The runtime merges `words.core` and `words.dataStack` into `this.words`.
- Types and enums are in `forth/types/types.js`; errors and messages are in `forth/errors/errors.js`.
- The demo UI (`demo/index.html`, `demo/main.js`) is the canonical way to run and exercise the VM; `demo/main.js` also calls the test harness in `tests/forth.test.js`.

How code is structured / important patterns
- ES modules with relative imports — files are loaded directly in the browser (no bundler expected). Keep imports as relative paths.
- Words are plain JS functions stored in objects. In `Fvm.parseWord` a matching word returns `new words.Word(name, callback)` and the VM calls `w.callback.call(this)` — callbacks expect `this` to be the `Fvm` instance. Always use `this` inside word callbacks (not closed-over VM references).
- Numeric parsing: `parseWord` returns a `NumberWord` when `Number(token)` is not NaN; math operators return `MathWord` with a `type` mapped to `types.MathTypes`.
- Error handling: on many errors the VM clears `dataStack` and throws a typed error from `forth/errors/errors.js`. Tests and the demo rely on error `name` and `message` values.

Where to make common changes
- Add or change words: edit `forth/words/core.js` or `forth/words/dataStack.js` and ensure `forth/words/index.js` exports them.
- Add new error types/messages: update `forth/errors/errors.js` and adjust error handling in `forth/forth.js` as needed.
- Add stateful behavior (colon definitions, control flow): extend `Fvm` and add parsing in `execute`/`parseWord`. Keep state in `this.state` using existing `types.ForthState` enum.

Developer workflows (how to run & test)
- Run in browser: open `demo/index.html` in a modern browser (best via a small local HTTP server). The demo UI provides a REPL-like textbox and buttons:
  - `Run test suite` runs the manual `FvmTestSuite` from `tests/forth.test.js` and prints output to the UI.
  - Use the textbox to type Forth code and press Enter.
- Quick local server example (recommended):
  - `python3 -m http.server` (from repo root) or `npx http-server` then open `http://localhost:8000/demo/`.
- There is no automated test runner configured. `tests/forth.test.js` exports `FvmTestSuite` — to run programmatically you can import it from a small Node script, but since the project uses browser ES modules the simplest path is the demo UI or add a `package.json` with `"type": "module"` and a small runner.

Project-specific conventions
- The VM frequently clears `this.dataStack` on errors — tests and callers expect this; preserve that behavior when changing error flows.
- Many helper functions use `this` (the FVM) rather than standalone functions — prefer methods on `Fvm` for operations that mutate runtime state.
- Words are defined as plain callbacks; adding words should be done by exporting them from `forth/words/*` and ensuring they are present in the merged object used by `Fvm`.

Integration & cross-component notes
- `demo/main.js` imports `Fvm` and the `FvmTestSuite` and contains the UI glue; changes to `Fvm` public API (method names or side-effects like `output` or `status`) must keep the demo and tests working.
- No bundler or build system is required — changes should keep browser-compatible ES module imports.

Examples (concrete)
- To inspect math handling: see `Fvm.attemptMathOperation`, `Fvm.operate`, and `getMathOperatorType` in `forth/forth.js`.
- To add a new word `neg`: add a property in `forth/words/core.js` and export it; the callback will run with `this` bound to the `Fvm` instance.

What to ask the repo owner
- Do you want a `package.json` with `"type": "module"` and a small `npm test` script to run the suite outside the browser?
- Should we add an automated test runner (Mocha/Jest) or keep the demo-driven test harness as the canonical runner?

If anything in this file is unclear or missing, tell me what you want added/changed and I'll iterate.
