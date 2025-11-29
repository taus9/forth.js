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
        this.words = {...words.core, ...words.dataStack}
    }

    // main logic function of program
    execute(text) {
        const wordStream = text.split(' ').filter(word => word !== '');
        this.output = '';

        for (let word of wordStream) {
            const w = this.parseWord(word);

            this.checkForComment(w);

            if (this.state === types.ForthState.INTERPRET) {
                if (w instanceof words.InvalidWord) {
                    this.status = types.StatusTypes.ERROR;
                    throw new errors.ParseError(errors.ErrorMessages.INVALID_WORD, w.rawText)
                }
    
                if (w instanceof words.NumberWord) {
                    this.dataStack.push(w.value);
                    continue;
                }
    
                if (w instanceof words.MathWord) {
                    this.attemptMathOperation(w.type)
                    continue;
                }
    
                if (w instanceof words.Word) {
                    w.callback.call(this);
                }
            }
            
        }

        this.status = types.StatusTypes.OK;
        this.state = types.ForthState.INTERPRET;
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
        
        if (word in this.words) {
            return new words.Word(word, this.words[word])
        }

        return new words.InvalidWord(word);
    }

    operate(var1, var2, type) {
        switch (type) {
            case types.MathTypes.ADD:
                return var1 + var2;
            case types.MathTypes.SUB:
                return var1 - var2;
            case types.MathTypes.MUL:
                return var1 * var2;
            case types. MathTypes.DIV:
                if (var2 === 0) {
                    throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
                }
                return var1 / var2;
            case types.MathTypes.POWER:
                return Math.pow(var2, var1);
            case types.MathTypes.MODULUS:
                return var1 % var2;
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
        }
    }

    attemptMathOperation(type) {
        // Need at least 2 operands to perform a math operation...duh...
        if (this.dataStack.length < 2) {
            this.status = types.StatusTypes.ERROR;
            this.dataStack = []; // clear the stack after error
            throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
        }
        
        // perform operation on stack
        const topVar = this.dataStack.pop();
        const bottomVar = this.dataStack.pop();
        const newVar = this.operate(topVar, bottomVar, type);

        this.dataStack.push(newVar);
    }

    checkStackUnderflow(equalToOrLessThan) {
        if (this.dataStack.length <= equalToOrLessThan) {
            this.status = types.StatusTypes.ERROR;
            this.dataStack = [];
            throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
        }
    }

    checkForComment(word) {
        if (word.rawText === '(' || word.rawText === ')') {
            word.callback.call(this)
        }
    }

    stackToString() {
        let ret = '';
        this.dataStack.forEach(n => {
            ret += n + ' '
        })
        return ret.trim();
    }
}
