"use strict";

import * as types from './types/types.js';
import * as errors from './errors/errors.js';
import * as words from './words/index.js';
import { ForthMemory } from './memory.js';
import { Cell } from './types/cell.js';
import { Word, NumberWord, CompileWord, TextWord } from './types/words.js';

export class Fvm {

    constructor() {
        this.dataStack = [];
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
        this.output = '';
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.inputStream = [];
        this.inputStreamIndex = 0;
        this.memory = new ForthMemory();
        // Always use 'this' inside word callbacks to access VM state (stack, status, etc).
        this.words = {...words.core, ...words.coreExt, ...words.misc}
    }
    

    reset() {
        this.output = '';
        this.dataStack = [];
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.inputStream = [];
        this.inputStreamIndex = 0;
        this.memory = new ForthMemory();
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
    }

    resetWords() {
        this.words = {
            ...words.core,
            ...words.coreExt,
            ...words.misc
        };
    }

    // Handles lexing and parsing
    tokenize(text) {
        let i = 0;
        const parsedWords = [];
        
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

        // First pass: tokenize and parse words (skip comments)
        while (i < text.length) {
            skipWhitespace();
            if (i >= text.length) break;

            if (isCommentStart()) {
                skipComment();
                continue;
            }
            
            const token = readToken().toUpperCase();
            const word = this.parseWord(token);

            parsedWords.push(word);
        }

        return parsedWords;
    }

    // Must pass string or array of Word instances
    execute(code) {
        this.output = '';
        
        if (typeof code === 'string') {
            this.inputStream = this.tokenize(code);
        } else if (Array.isArray(code)) {
            this.inputStream = code;
        } else {
            throw new errors.InterpreterError(errors.ErrorMessages.INVALID_CODE);
        }

        this.inputStreamIndex = 0;
        while (this.inputStreamIndex < this.inputStream.length) {
            const word = this.inputStream[this.inputStreamIndex++];

            // Start of a new word definition
            if (word instanceof CompileWord && word.name === ':') {
                if (this.state === types.ForthState.COMPILE) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.NESTED_DEFINITION);
                }
                if (this.inputStreamIndex >= this.inputStream.length) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.NAME_EXPECTED);
                }
                
                const wordName = this.inputStream[this.inputStreamIndex++].name;

                if (!this.isValidWordName(wordName)) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
                }

                // TODO: A program shall not create definition names containing non-graphic characters. 
                this.compilingWord = wordName; // temporarily hold the word being defined
                this.compilationBuffer = []; // array of Word instances
                this.state = types.ForthState.COMPILE;
                continue;
            }

            if (word instanceof CompileWord && word.name === ';') {
                if (this.state !== types.ForthState.COMPILE) {
                    this.reset();
                    throw new errors.ParseError(errors.ErrorMessages.COMPILE_ONLY_WORD, word);
                }

                if (this.isWordRedefined(this.compilingWord)) {
                    this.output = `redefined ${this.compilingWord}`;
                }
                const code = this.compilationBuffer;
                this.words[this.compilingWord] = function() {
                   this.execute(code); 
                }
                
                this.compilingWord = '';
                this.compilationBuffer = [];
                this.state = types.ForthState.INTERPRET;
                continue;
            }

            if (this.state === types.ForthState.COMPILE) {
                this.compilationBuffer.push(word);
                continue;
            }

            if (this.state === types.ForthState.INTERPRET) {

                if (word instanceof NumberWord) {
                    this.dataStack.push(word.cell);
                    continue;
                }
                
                if (word instanceof Word) {
                    word.callback.call(this);
                    continue;
                }

                this.reset();
                throw new errors.ParseError(errors.ErrorMessages.UNDEFINED_WORD, word.name);
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
        const word = text.trim().toUpperCase();
        
        if (word === ':' || word === ';') {
            return new CompileWord(word);
        }

        // Order is important here, in order to be able
        // to redefine words like "+", "dup", "123", etc.
        if (Object.hasOwn(this.words, word)) {
            // say this three times fast...
            return new Word(word, this.words[word])
        }

        const val = Number(word);
        if (!isNaN(val)) {
            return new NumberWord(word, new Cell(val))
        }
        
        return new TextWord(word);
    }

    checkStackUnderflow(requiredStackLength) {
        if (this.dataStack.length < requiredStackLength) {
            this.reset();
            throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
        }
    }
}
