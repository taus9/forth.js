import * as errors from '../errors/errors.js';
import * as types from '../types/types.js';
import { Cell } from '../types/cell.js';

export const core = {
    // https://forth-standard.org/standard/core/Times
    '*': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const n3 = new Cell(n1.toUnsigned() * n2.toUnsigned());
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/Plus
    '+': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const n3 = new Cell(n1.toUnsigned() + n2.toUnsigned());
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/Minus
    '-': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const n3 = new Cell(n1.toUnsigned() - n2.toUnsigned());
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/Div
    '/': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const dividend = n1.toSigned();
        const divisor = n2.toSigned();
        if (divisor === 0n) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division (rounds toward negative infinity) 
        let quotient = dividend / divisor;
        const remainder = dividend % divisor;
        if (remainder !== 0n && ((remainder > 0n && divisor < 0n) || (remainder < 0n && divisor > 0n))) {
            quotient -= 1n;
        }
        const n3 = new Cell(quotient);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/DivMOD
    '/MOD': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const dividend = n1.toSigned();
        const divisor = n2.toSigned();
        if (divisor === 0n) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division (rounds toward negative infinity) 
        let quotient = dividend / divisor;
        let remainder = dividend % divisor;
        if (remainder !== 0n && ((remainder > 0n && divisor < 0n) || (remainder < 0n && divisor > 0n))) {
            quotient -= 1n;
            remainder += divisor;
        }
        const n3 = new Cell(quotient);
        const n4 = new Cell(remainder);
        this.dataStack.push(n4);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/MOD
    'MOD': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const dividend = n1.toSigned();
        const divisor = n2.toSigned();
        if (divisor === 0n) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division (rounds toward negative infinity) 
        let remainder = dividend % divisor;
        if (remainder !== 0n && ((remainder > 0n && divisor < 0n) || (remainder < 0n && divisor > 0n))) {
            remainder += divisor;
        }
        const n3 = new Cell(remainder);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/ABS
    'ABS': function() { // tested
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const abs = n.toSigned() < 0n ? -n.toSigned() : n.toSigned();
        const u = new Cell(abs);
        this.dataStack.push(u);
    },
    // https://forth-standard.org/standard/core/OneMinus
    '1-': function() { // tested
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = new Cell(n1.toUnsigned() - 1n);
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/OnePlus
    '1+': function() { // tested
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = new Cell(n1.toUnsigned() + 1n);
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/NEGATE
    'NEGATE': function() { // tested
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = new Cell(-n1.toSigned());
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/MIN
    'MIN': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const min = n1.toSigned() < n2.toSigned() ? n1.toSigned() : n2.toSigned();
        const n3 = new Cell(min);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/MAX
    'MAX': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const max = n1.toSigned() > n2.toSigned() ? n1.toSigned() : n2.toSigned();
        const n3 = new Cell(max);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/DROP
    'DROP': function(){ // tested
        this.checkStackUnderflow(1);
        this.dataStack.pop();
    },
    // https://forth-standard.org/standard/core/DUP
    'DUP': function() { // tested
        this.checkStackUnderflow(1);
        const w = this.dataStack[this.dataStack.length - 1];
        this.dataStack.push(w);      
    },
    // https://forth-standard.org/standard/core/OVER
    'OVER': function() { // tested
        this.checkStackUnderflow(2);
        const w1 = this.dataStack[this.dataStack.length - 2];
        this.dataStack.push(w1);
    },
    // https://forth-standard.org/standard/core/SWAP
    'SWAP': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w1);
    },
    // https://forth-standard.org/standard/core/ROT
    'ROT': function() { // tested
        this.checkStackUnderflow(3);
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w3, w1);
    },
    // https://forth-standard.org/standard/core/qDUP
    '?DUP': function() { // tested
        this.checkStackUnderflow(1);
        const topNumber = this.dataStack[this.dataStack.length - 1];
        if (topNumber.toNumber() !== 0) {
            this.dataStack.push(topNumber);   
        }
    },
    // https://forth-standard.org/standard/core/TwoDROP
    '2DROP': function() { // tested
        this.checkStackUnderflow(2);
        this.dataStack.pop(); // w2
        this.dataStack.pop(); // w1
    },
    // https://forth-standard.org/standard/core/TwoDUP
    '2DUP': function() { //tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w1, w2, w1, w2);
    },
    // https://forth-standard.org/standard/core/TwoOVER
    '2OVER': function() { // tested
        this.checkStackUnderflow(4);
        const len = this.dataStack.length
        const w1 = this.dataStack[len - 4];
        const w2 = this.dataStack[len - 3];
        this.dataStack.push(w1, w2);
    },
    // https://forth-standard.org/standard/core/TwoSWAP
    '2SWAP': function() { // tested
        this.checkStackUnderflow(4);
        const w4 = this.dataStack.pop();
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push (
            w3, w4, w1, w2
        );
    },
    // https://forth-standard.org/standard/core/d
    '.': function() { // tested
        this.checkStackUnderflow(1);
        const w1 = this.dataStack.pop();
        this.output = `${w1.toSigned()}`;
    },
    // https://forth-standard.org/standard/core/Equal
    '=': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const flag = (n1.toUnsigned() === n2.toUnsigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/less
    '<': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const flag = (n1.toSigned() < n2.toSigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/more
    '>': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const flag = (n1.toSigned() > n2.toSigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/Uless
    'U<': function() { // tested
        this.checkStackUnderflow(2);
        const u2 = this.dataStack.pop();
        const u1 = this.dataStack.pop();
        const flag = (u1.toUnsigned() < u2.toUnsigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/ZeroEqual
    '0=': function() { // tested
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const flag = (n.toUnsigned() === 0n) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/Zeroless
    '0<': function() { // tested
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const flag = (n.toSigned() < 0) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/TwoTimes
    '2*': function() { // tested
        this.checkStackUnderflow(1);
        const x1 = this.dataStack.pop();
        const x2 = new Cell(x1.toUnsigned() << 1n);
        this.dataStack.push(x2);    
    },
    // https://forth-standard.org/standard/core/TwoDiv
    '2/': function() { // tested
        this.checkStackUnderflow(1);
        const x1 = this.dataStack.pop();
        const x2 = new Cell(x1.toUnsigned() >> 1n);
        this.dataStack.push(x2);    
    },
    // https://forth-standard.org/standard/core/AND
    'AND': function() { // tested
        this.checkStackUnderflow(2);
        const x2 = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        const x3 = new Cell(x1.toUnsigned() & x2.toUnsigned());
        this.dataStack.push(x3);
    },
    // https://forth-standard.org/standard/core/OR
    'OR': function() { // tested
        this.checkStackUnderflow(2);
        const x2 = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        const x3 = new Cell(x1.toUnsigned() | x2.toUnsigned());
        this.dataStack.push(x3);
    },
    // https://forth-standard.org/standard/core/XOR
    'XOR': function() { // tested
        this.checkStackUnderflow(2);
        const x2 = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        const x3 = new Cell(x1.toUnsigned() ^ x2.toUnsigned());
        this.dataStack.push(x3);
    },
    // https://forth-standard.org/standard/core/INVERT
    'INVERT': function() { // tested
        this.checkStackUnderflow(1);
        const x1 = this.dataStack.pop();
        const x2 = new Cell(~x1.toUnsigned());
        this.dataStack.push(x2);
    },
    // https://forth-standard.org/standard/core/LSHIFT
    'LSHIFT': function() { // tested
        this.checkStackUnderflow(2);
        const u = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        // Wrap shift amount to 0-63 range (modulo 64)
        const shiftAmount = u.toUnsigned() & 63n;
        const x2 = new Cell(x1.toUnsigned() << shiftAmount);
        this.dataStack.push(x2);
    },
    // https://forth-standard.org/standard/core/RSHIFT
    'RSHIFT': function() { // tested
        this.checkStackUnderflow(2);
        const u = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        // Wrap shift amount to 0-63 range (modulo 64)
        const shiftAmount = u.toUnsigned() & 63n;
        const x2 = new Cell(x1.toUnsigned() >> shiftAmount);
        this.dataStack.push(x2);
    },
    // https://forth-standard.org/standard/core/Ud
    'U.': function() { // tested
        this.checkStackUnderflow(1);
        const u1 = this.dataStack.pop();
        this.output = `${u1.toUnsigned()}`;
    },
    // https://forth-standard.org/standard/core/StoD
    'S>D': function() {
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const signedValue = n.toSigned();
        const lowPart = new Cell(signedValue & 0xFFFFFFFFFFFFFFFFn);
        const highPart = new Cell((signedValue >> 64n) & 0xFFFFFFFFFFFFFFFFn);
        this.dataStack.push(lowPart);
        this.dataStack.push(highPart);
    },
    // https://forth-standard.org/standard/core/TimesDiv
    '*/': function() {
        // The Forth Standard says the the product of n1 and n2
        // should be a 2-cell signed integer, which is then
        // divided by n3. This may need to be implemented at some point.
        // for full ANS Forth compliance.
        this.checkStackUnderflow(3);
        const n3 = this.dataStack.pop();
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const product = n1.toSigned() * n2.toSigned();
        if (n3.toSigned() === 0n) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division (rounds toward negative infinity) 
        let quotient = product / n3.toSigned();
        const remainder = product % n3.toSigned();
        if (remainder !== 0n && ((remainder > 0n && n3.toSigned() < 0n) || (remainder < 0n && n3.toSigned() > 0n))) {
            quotient -= 1n;
        }
        const n4 = new Cell(quotient);
        this.dataStack.push(n4);
    },
    // https://forth-standard.org/standard/core/TimesDivMOD
    '*/MOD': function() {
        // The Forth Standard says the the product of n1 and n2
        // should be a 2-cell signed integer, which is then
        // divided by n3. This may need to be implemented at some point.
        // for full ANS Forth compliance.
        this.checkStackUnderflow(3);
        const n3 = this.dataStack.pop();
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const product = n1.toSigned() * n2.toSigned();
        if (n3.toSigned() === 0n) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division (rounds toward negative infinity) 
        let quotient = product / n3.toSigned();
        let remainder = product % n3.toSigned();
        if (remainder !== 0n && ((remainder > 0n && n3.toSigned() < 0n) || (remainder < 0n && n3.toSigned() > 0n))) {
            quotient -= 1n;
            remainder += n3.toSigned();
        }
        const n4 = new Cell(quotient);
        const n5 = new Cell(remainder);
        this.dataStack.push(n5);
        this.dataStack.push(n4);
    },
    // https://forth-standard.org/standard/core/DEPTH
    'DEPTH': function() {
        const n = new Cell(this.dataStack.length);
        this.dataStack.push(n);
    },
    // https://forth-standard.org/standard/core/VARIABLE
    'VARIABLE': function () {
        if (this.inputStreamIndex >= this.inputStream.length) {
            this.reset();
            throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
        }
        const varName = this.inputStream[this.inputStreamIndex++].name;

        if (!this.isValidWordName(varName)) {
            this.reset();
            throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
        }

        if (this.isWordRedefined(varName)) {
            this.output = `redefined ${varName}`;
        }

        const address = this.memory.allocate()
    
        this.words[varName] = function() {
            this.dataStack.push(new Cell(address));
        };
    }
};