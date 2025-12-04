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

    resetWords() {
        this.words = {...words.core, ...words.dataStack};
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

            const token = readToken().toUpperCase();
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

                if (this.isWordRedefined(this.compilingWord)) {
                    this.output = `redefined ${this.compilingWord}`;
                }
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
                
                if (word instanceof words.Word) {
                    word.callback.call(this);
                    continue;
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

    // needed so we can output 'redefined' to the console
    isWordRedefined(word) {
        return ( 
            Object.hasOwn(this.words, word) ||
            !isNaN(Number(word))
        );
    }

    parseWord(text) {
        // Forth words are case-insensitive
        let word = text.trim().toUpperCase();
        let val = Number(word);
        
        // Order is important here, in order to be able
        // to redefine words like "+", "dup", "123", etc.
        if (Object.hasOwn(this.words, word)) {
            // say this three times fast...
            return new words.Word(word, this.words[word])
        }

        if (!isNaN(val)) {
            return new words.NumberWord(word, val)
        }
            
        return new words.InvalidWord(word);
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
