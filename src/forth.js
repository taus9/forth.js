"use strict";

import * as types from './types/types.js';
import * as errors from './errors/errors.js';
import * as words from './words/index.js';
import { ForthMemory } from './memory.js';
import { Cell } from './types/cell.js';
import { Word, NumberWord, CompileWord, TextWord } from './types/words.js';

export class Fvm {

    constructor() {
        this.reset();
        // Always use 'this' inside word callbacks to access VM state (stack, status, etc).
        this.words = {...words.core, ...words.coreExt, ...words.misc}
    }
    

    reset() {
        this.output = '';
        this.dataStack = [];
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.executionStack = [];
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
        
        const words = Array.isArray(code) ? code : this.tokenize(code);
        const frame = {words, index: 0};
        this.executionStack.push(frame);
        
        try {
            while (frame.index < frame.words.length) {
                const word = frame.words[frame.index++];

                if (word.name === ':') {
                    if (this.state === types.ForthState.COMPILE) {
                        this.reset();
                        throw new errors.ParseError(errors.ErrorMessages.NESTED_DEFINITION);
                    }
                    if (frame.index >= frame.words.length) {
                        this.reset();
                        throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
                    }
                    const wordName = words[frame.index++].name;
        
                    if (!this.isValidWordName(wordName)) {
                        this.reset();
                        throw new errors.ParseError(errors.ErrorMessages.INVALID_WORD_NAME);
                    }
        
                    // TODO: A program shall not create definition names containing non-graphic characters. 
                    this.compilingWord = wordName; // temporarily hold the word being defined
                    this.compilationBuffer = []; // array of Word instances
                    this.state = types.ForthState.COMPILE;
                    continue;
                }

                // the interpreter as it is has to treat
                // the ; word as a special case. This is not
                // ANS Forth compliant, but it works for now.
                if (word.name === ';') {
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
        } finally {
            this.executionStack.pop();
        }

        this.status = 
            this.state === types.ForthState.INTERPRET
            ? types.StatusTypes.OK
            : types.StatusTypes.COMPILED;
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
