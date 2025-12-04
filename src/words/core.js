import * as errors from '../errors/errors.js';

export const core = {
    // https://forth-standard.org/standard/core/Times
    '*': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        // TODO: handle overflow and unsigned ints
        const n3 = n1 * n2;
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/Plus
    '+': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        // TODO: handle overflow and unsigned ints
        const n3 = n1 + n2;
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/Minus
    '-': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        // TODO: handle overflow and unsigned ints
        const n3 = n1 - n2;
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/Div
    '/': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        if (n2 === 0) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // TODO: handle overflow and unsigned ints
        const n3 = Math.floor(n1 / n2);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/DivMOD
    '/MOD': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        if (n2 === 0) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        const n3 = n1 % n2;
        const n4 = Math.floor(n1 / n2);
        this.dataStack.push(n3);
        this.dataStack.push(n4);
    },
    // https://forth-standard.org/standard/core/MOD
    'MOD': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        if (n2 === 0) {
            this.reset();
            throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
        }
        // TODO: handle overflow and unsigned ints
        const n3 = n1 % n2;
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/ABS
    'ABS': function() {
        this.checkStackUnderflow(1);
        const n = this.dataStack.pop();
        const u = Math.abs(n);
        this.dataStack.push(u);
    },
    // https://forth-standard.org/standard/core/OneMinus
    '1-': function() {
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = n1 - 1;
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/OnePlus
    '1+': function() {
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = n1 + 1;
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/NEGATE
    'NEGATE': function() {
        this.checkStackUnderflow(1);
        const n1 = this.dataStack.pop();
        const n2 = -n1;
        this.dataStack.push(n2);
    },
    // https://forth-standard.org/standard/core/MIN
    'MIN': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const n3 = Math.min(n1, n2);
        this.dataStack.push(n3);
    },
    // https://forth-standard.org/standard/core/MAX
    'MAX': function() {
        this.checkStackUnderflow(2);
        const n2 = this.dataStack.pop();
        const n1 = this.dataStack.pop();
        const n3 = Math.max(n1, n2);
        this.dataStack.push(n3);
    },
}