"use strict";

import * as types from './types/types.js';
import * as errors from './errors/errors.js';
import * as words from './words/index.js';
import { ForthMemory } from './memory.js';
import { Cell } from './types/cell.js';
import { Word, NumberWord, StringLiteralWord, TextWord } from './types/words.js';

export class Fvm {

    constructor() {
        this.output = '';
        this.dataStack = [];
        this.executionStack = [];
        this.controlStack = [];
        this.returnStack = [];
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.memory = new ForthMemory();
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;

        // Always use 'this' inside word callbacks to access VM state (stack, status, etc).
        this.words = {...words.core, ...words.coreExt, ...words.misc}
    }
    

    errorReset() {
        this.output = '';
        this.dataStack = [];
        this.executionStack = [];
        this.controlStack = [];
        this.returnStack = [];
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
    }

    resetFVM() {
        this.output = '';
        this.dataStack = [];
        this.executionStack = [];
        this.controlStack = [];
        this.returnStack = [];
        this.compilingWord = '';
        this.compilationBuffer = [];
        this.memory = new ForthMemory();
        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
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
            

            const token = readToken();

            if (token === '."') {
                // Handle string literal until next "
                let strLiteral = '';
                i++ // skip space after ."
                while (i < text.length && text[i] !== '"') {
                    strLiteral += text[i];
                    i++;
                }
                if (i < text.length && text[i] === '"') {
                    i++; // skip closing "
                } else {
                    this.errorReset();
                    throw new errors.ParseError(errors.ErrorMessages.UNTERMINATED_STRING);
                }
                parsedWords.push(new Word('."', this.words['."'].entry, this.words['."'].flags));
                parsedWords.push(new StringLiteralWord(strLiteral));
                continue;
            }

            const word = this.parseWord(token.toUpperCase());
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

                if (this.state === types.ForthState.COMPILE) {
                    
                    if (word instanceof Word 
                        && word.flags.includes(types.FlagTypes.DEFINING_WORD)) {
                        this.errorReset();
                        throw new errors.ParseError(errors.ErrorMessages.INVALID_WORD_NAME, word.name);
                    }

                    if (word instanceof Word 
                        && word.flags.includes(types.FlagTypes.IMMEDIATE)) {
                        word.callback.call(this);
                        continue;
                    }

                    this.compilationBuffer.push(word);
                    continue;
                }

                if (this.state === types.ForthState.INTERPRET) {

                    if (word instanceof Word 
                        && word.flags.includes(types.FlagTypes.COMPILE_ONLY)) {
                        this.errorReset();
                        throw new errors.InterpreterError(errors.ErrorMessages.COMPILE_ONLY_WORD);
                    }

                    if (word instanceof NumberWord) {
                        this.dataStack.push(word.cell);
                        continue;
                    }
                
                    if (word instanceof Word) {
                        word.callback.call(this);
                        continue;
                    }

                    this.errorReset();
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
            const {entry, flags} = this.words[word];
            return new Word(word, entry, flags);
        }

        const val = Number(word);
        if (!isNaN(val)) {
            return new NumberWord(word, new Cell(val))
        }
        
        return new TextWord(word);
    }

    checkStackUnderflow(requiredStackLength) {
        if (this.dataStack.length < requiredStackLength) {
            this.errorReset();
            throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
        }
    }

    getOutput() {
        return this.output;
    }
}
