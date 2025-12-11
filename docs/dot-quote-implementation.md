# The `."` (Dot-Quote) Word Implementation

## Overview

The `."` (dot-quote) word is a standard Forth word that outputs a string literal during execution. It's used within colon definitions to print text.

## Standard Forth Behavior

In ANS Forth, `."` is an **IMMEDIATE** and **COMPILE-ONLY** word that:
1. Reads all characters from the input stream up to the closing `"`
2. Compiles code that will output those characters at runtime
3. Can only be used within colon definitions (between `:` and `;`)

### Example Usage

```forth
: greet ."Hello, World!" ;
greet  ( outputs: Hello, World! )

: answer 42 . ."is the answer" ;
answer  ( outputs: 42 is the answer )
```

## Internal Implementation

### Architecture Components

The implementation involves three main components:

1. **StringWord Class** (`src/types/words.js`)
   - A new word type that holds string literal data
   - Similar to `NumberWord` but for strings
   - Not directly executed; consumed by `."` during compilation

2. **Tokenizer Enhancement** (`src/forth.js`)
   - Special handling for `."` in the tokenizer
   - Reads everything between `."` and `"` as a string literal
   - Creates both a `Word('."')` and a `StringWord(text)` token

3. **Compile-Time Word** (`src/words/core.js`)
   - The `."` word itself with IMMEDIATE and COMPILE_ONLY flags
   - Consumes the StringWord from the execution frame
   - Creates a closure that captures the string and outputs it at runtime

### Execution Flow

#### 1. Tokenization Phase

When `."Hello"` is encountered in source code:

```javascript
// Input: '."Hello"'
// Tokenizer produces:
[
  Word('."'),      // The dot-quote word
  StringWord('Hello')  // The string literal
]
```

The tokenizer's `isDotQuote()` function detects `."` and calls `readString()` to extract the text between `."` and `"`.

#### 2. Compilation Phase (Inside `:` ... `;`)

When compiling a colon definition:

1. The `:` word enters COMPILE state
2. Words are normally added to the `compilationBuffer`
3. When `."` is encountered (IMMEDIATE flag), it executes immediately:
   - Consumes the next token (the StringWord)
   - Creates a closure that captures the string
   - Adds this closure to the compilation buffer

```javascript
'."': {
    'flags': [types.FlagTypes.IMMEDIATE, types.FlagTypes.COMPILE_ONLY],
    'entry': function() {
        // Get the StringWord from execution frame
        const frame = this.executionStack[this.executionStack.length - 1];
        const stringWord = frame.words[frame.index++];
        
        // Capture string in a closure
        const str = stringWord.string;
        const printWord = new Word('(.")', function() {
            this.output += str;
        }, []);
        
        // Add to compilation buffer
        this.compilationBuffer.push(printWord);
    }
}
```

#### 3. Runtime Phase

When the compiled word executes:

1. The closure created during compilation runs
2. It appends the captured string to `this.output`
3. No additional token consumption needed

### Key Design Decisions

#### Why Use Closures?

The closure-based approach captures the string at compile time, eliminating the need to:
- Store StringWord objects in the compilation buffer
- Handle StringWord during execution
- Maintain separate runtime helper words in the dictionary

This is more efficient and cleaner than passing string data through the execution frame.

#### String Parsing Rules

- Everything between `."` and the closing `"` is captured, including:
  - Leading and trailing spaces
  - Multiple spaces
  - Special characters
- The space immediately after `."` is part of the string:
  - `." Hello"` outputs " Hello" (with leading space)
  - `."Hello"` outputs "Hello" (no leading space)

#### Error Handling

Unterminated strings (missing closing `"`) throw a `ParseError` with the message `UNTERMINATED_STRING`.

### Integration with Output System

The `."` word appends to `this.output`, which is:
- Cleared at the start of each `execute()` call
- Retrieved via `getOutput()` (no longer trimmed after this implementation)
- Displayed in the demo UI after each command

Note: The removal of `.trim()` from `getOutput()` was necessary to preserve leading/trailing spaces in string output.

## Testing

Tests in `tests/compile.test.js` verify:
- ✓ Basic string output
- ✓ Empty strings
- ✓ Strings with spaces (leading, trailing, multiple)
- ✓ Combining with numeric output (`.` word)
- ✓ Multiple `."` in one definition
- ✓ Error handling for unterminated strings

## Differences from Full ANS Forth

This implementation is simplified:
- Only works in colon definitions (compile-only)
- No support for escaped characters or special formatting
- No support for `S"` (string literal on stack) or other string words

For a full ANS Forth implementation, additional string words would include:
- `S"` - String literal (pushes address and length)
- `C"` - Counted string
- `ABORT"` - Conditional abort with message
- `."` in interpret mode (immediate output without compilation)
