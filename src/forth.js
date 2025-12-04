"use strict";

import * as types from './types/types.js';
import * as errors from './errors/errors.js';
import * as words from './words/index.js';

export class Fvm {

    constructor() {
        this.dataStack = [];
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
        this.output = '';
        this.compilingWord = '';
        this.compilationBuffer = [];
        // Merge word definitions: dataStack words override core words if names collide.
        // Always use 'this' inside word callbacks to access VM state (stack, status, etc).
        this.words = {...words.core, ...words.dataStack}
    }
    
    reset() {
        this.output = '';
        this.dataStack = [];
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
    }

    tokenize(text) {
        let i = 0;
        const tokens = [];

        const skipWhitespace = () => {
            while (i < text.length && /\s/.test(text[i])) i++;
        };

        const isCommentStart = () =>
            text[i] === '('

        const skipComment = () => {
            i++; // skip '('
            while (i < text.length && text[i] !== ')') i++;
            if (text[i] === ')') i++; // skip ')'
        };

        const readToken = () => {
            const start = i;
            while (i < text.length && !/\s/.test(text[i])) i++;
            return text.slice(start, i);
        };

        // First pass: tokenize (skip comments)
        while (i < text.length) {
            skipWhitespace();
            if (i >= text.length) break;

            if (isCommentStart()) {
                skipComment();
                continue;
            }

            const token = readToken();
            tokens.push(token);
        }
        return tokens;
    }

    execute(text) {
        this.output = '';
        const tokens = this.tokenize(text);

        let tokenIndex = 0;
        while (tokenIndex < tokens.length) {
            const token = tokens[tokenIndex++];

            // Start of a new word definition
            if (token === ':') {
                if (this.state === types.ForthState.COMPILE) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.NESTED_DEFINITION);
                }
                if (tokenIndex >= tokens.length) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.NAME_EXPECTED);
                }
                const wordName = tokens[tokenIndex++];
                if (!this.isValidWordName(wordName)) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.INVALID_WORD_NAME);
                }
                this.compilingWord = wordName;
                this.compilationBuffer = [];
                this.state = types.ForthState.COMPILE;
                continue;
            }

            if (token === ';') {
                if (this.state !== types.ForthState.COMPILE) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.COMPILE_ONLY_WORD, token);
                }
                // Capture the buffer value NOW (not reference to this.compilationBuffer)
                const code = this.compilationBuffer.join(' ');
                this.words[this.compilingWord] = function() {
                   this.execute(code); 
                }
                this.compilingWord = '';
                this.compilationBuffer = [];
                this.state = types.ForthState.INTERPRET;
                continue;
            }

            if (this.state === types.ForthState.COMPILE) {
                const word = this.parseWord(token);
                if (word instanceof words.InvalidWord) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.UNDEFINED_WORD, word.rawText);
                }
                this.compilationBuffer.push(token);
                continue;
            }

            if (this.state === types.ForthState.INTERPRET) {
                const word = this.parseWord(token);
                if (word instanceof words.InvalidWord) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.UNDEFINED_WORD, word.rawText);
                }

                if (word instanceof words.NumberWord) {
                    this.dataStack.push(word.value);
                    continue;
                }

                if (word instanceof words.MathWord) {
                    this.attemptMathOperation(word.type);
                    continue;
                }

                if (word instanceof words.Word) {
                    word.callback.call(this);
                }
            }
        }

        if (this.state === types.ForthState.INTERPRET) {
            this.status = types.StatusTypes.OK;
        } else {
            this.status = types.StatusTypes.COMPILED;
        }
    }

    isValidWordName(name) {
        // in ANS Forth ":" and ";" are valid word names and can be redefined
        if (name === ":" || name === ";") {
            return false;
        }
        return true;
    }

    parseWord(text) {
        let word = text.trim();
        let val = Number(word);
        
        if (!isNaN(val)) {
            return new words.NumberWord(word, val)
        }
    
        if (this.isMathOperator(word)) {
            const type = this.getMathOperatorType(word)
            return new words.MathWord(word, type)
        }
        
        if (Object.hasOwn(this.words, word)) {
            // say this three times fast...
            return new words.Word(word, this.words[word])
        }

        return new words.InvalidWord(word);
    }

    operate(var1, var2, type) {
        switch (type) {
            case types.MathTypes.ADD:
                return var1 + var2;
            case types.MathTypes.SUB:
                return var2 - var1;
            case types.MathTypes.MUL:
                return var1 * var2;
            case types.MathTypes.DIV:
                if (var1 === 0) {
                    this.reset();
                    throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
                }
                return Math.floor(var2 / var1);
            case types.MathTypes.POWER:
                return Math.pow(var2, var1);
            case types.MathTypes.MODULUS:
                return var2 % var1;
            default:
                this.reset();
                throw new errors.OperationError(errors.ErrorMessages.UNDEFINED_WORD);
        }
    }

    isMathOperator(word) {
        switch (word) {
            case '+': 
            case '-':
            case '*': 
            case '**': 
            case '/': 
            case '%':
                return true;
           default:
                return false;
        }
    }

    getMathOperatorType(word) {
        switch (word) {
            case '+':
                return types.MathTypes.ADD;
            case '-':
                return types.MathTypes.SUB;
            case '*':
                return types.MathTypes.MUL;
            case '**':
                return types.MathTypes.POWER
            case '/':
                return types.MathTypes.DIV;
            case '%':
                return types.MathTypes.MODULUS;
            default:
                this.reset();
                throw new errors.ParseError(errors.ErrorMessages.UNDEFINED_WORD);
        }
    }

    attemptMathOperation(type) {
        // Need at least 2 operands to perform a math operation...duh...
        if (this.dataStack.length < 2) {
            this.reset();
            throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
        }
        
        // perform operation on stack
        const topVar = this.dataStack.pop();
        const bottomVar = this.dataStack.pop();
        const newVar = this.operate(topVar, bottomVar, type);

        // Clamp very large numbers and Infinity to 0
        // Use MAX_SAFE_INTEGER as threshold for "very large"
        const result = 
            Math.abs(newVar) <= Number.MAX_SAFE_INTEGER ? newVar : 0;
            //(Number.isFinite(newVar) && Math.abs(newVar) <= Number.MAX_SAFE_INTEGER) ? newVar : 0;
        this.dataStack.push(result);
    }

    checkStackUnderflow(requiredStackLength) {
        if (this.dataStack.length < requiredStackLength) {
            this.reset();
            throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
        }
    }

    stackToString() {
        return this.dataStack.join(' ');
    }
}
