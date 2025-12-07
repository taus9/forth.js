import { Cell } from '../types/cell.js';
import * as errors from '../errors/errors.js';

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
        if (n2.toNumber() === 0) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division (rounds toward negative infinity)
        const a = n1.toNumber();
        const b = n2.toNumber();
        const quotient = Math.floor(a / b);
        const n3 = new Cell(quotient);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/DivMOD
    '/MOD': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        if (n2.toNumber() === 0) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored division
        const a = n1.toNumber();
        const b = n2.toNumber();
        const quotient = Math.floor(a / b);
        const remainder = a - (quotient * b);
        this.dataStack.push(new Cell(remainder));
        this.dataStack.push(new Cell(quotient));
    },
    // https://forth-standard.org/standard/core/MOD
    'MOD': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        if (n2.toNumber() === 0) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // Forth uses floored modulo (consistent with floored division)
        const a = n1.toNumber();
        const b = n2.toNumber();
        const quotient = Math.floor(a / b);
        const remainder = a - (quotient * b);
        this.dataStack.push(new Cell(remainder));
    },
    // https://forth-standard.org/standard/core/ABS
    'ABS': function() { // tested
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const u = new Cell(Math.abs(n.toNumber()));
        this.dataStack.push(u);
    },
    // https://forth-standard.org/standard/core/OneMinus
    '1-': function() { // tested
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = new Cell(n1.toNumber() - 1);
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/OnePlus
    '1+': function() { // tested
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = new Cell(n1.toNumber() + 1);
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
        const n3 = new Cell(Math.min(n1.toNumber(), n2.toNumber()));
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/MAX
    'MAX': function() { // tested
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const n3 = new Cell(Math.max(n1.toNumber(), n2.toNumber()));
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
    '=': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const flag = (n1.toUnsigned() === n2.toUnsigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/less
    '<': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const flag = (n1.toSigned() < n2.toSigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/more
    '>': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const flag = (n1.toSigned() > n2.toSigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/Uless
    'U<': function() {
        this.checkStackUnderflow(2);
        const u2 = this.dataStack.pop();
        const u1 = this.dataStack.pop();
        const flag = (u1.toUnsigned() < u2.toUnsigned()) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/ZeroEqual
    '0=': function() {
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const flag = (n.toUnsigned() === 0) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/Zeroless
    '0<': function() {
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const flag = (n.toSigned() < 0) ? -1 : 0;
        this.dataStack.push(new Cell(flag));
    },
    // https://forth-standard.org/standard/core/TwoTimes
    '2*': function() {
        this.checkStackUnderflow(1);
        const x1 = this.dataStack.pop();
        const x2 = new Cell(x1.toUnsigned() << 1n);
        this.dataStack.push(x2);    
    },
    // https://forth-standard.org/standard/core/TwoDiv
    '2/': function() {
        this.checkStackUnderflow(1);
        const x1 = this.dataStack.pop();
        const x2 = new Cell(x1.toUnsigned() >> 1n);
        this.dataStack.push(x2);    
    },
    // https://forth-standard.org/standard/core/AND
    'AND': function() {
        this.checkStackUnderflow(2);
        const x2 = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        const x3 = new Cell(x1.toUnsigned() & x2.toUnsigned());
        this.dataStack.push(x3);
    },
    // https://forth-standard.org/standard/core/OR
    'OR': function() {
        this.checkStackUnderflow(2);
        const x2 = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        const x3 = new Cell(x1.toUnsigned() | x2.toUnsigned());
        this.dataStack.push(x3);
    },
    // https://forth-standard.org/standard/core/XOR
    'XOR': function() {
        this.checkStackUnderflow(2);
        const x2 = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        const x3 = new Cell(x1.toUnsigned() ^ x2.toUnsigned());
        this.dataStack.push(x3);
    },
    // https://forth-standard.org/standard/core/INVERT
    'INVERT': function() {
        this.checkStackUnderflow(1);
        const x1 = this.dataStack.pop();
        const x2 = new Cell(~x1.toUnsigned());
        this.dataStack.push(x2);
    },
    // https://forth-standard.org/standard/core/LSHIFT
    'LSHIFT': function() {
        this.checkStackUnderflow(2);
        const u = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        // Wrap shift amount to 0-63 range (modulo 64)
        const shiftAmount = u.toUnsigned() & 63n;
        const x2 = new Cell(x1.toUnsigned() << shiftAmount);
        this.dataStack.push(x2);
    },
    // https://forth-standard.org/standard/core/RSHIFT
    'RSHIFT': function() {
        this.checkStackUnderflow(2);
        const u = this.dataStack.pop();
        const x1 = this.dataStack.pop();
        // Wrap shift amount to 0-63 range (modulo 64)
        const shiftAmount = u.toUnsigned() & 63n;
        const x2 = new Cell(x1.toUnsigned() >> shiftAmount);
        this.dataStack.push(x2);
    },

}