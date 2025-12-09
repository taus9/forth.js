import * as errors from '../errors/errors.js';
import * as types from '../types/types.js';
import { Cell } from '../types/cell.js';
import { Word, NumberWord } from '../types/words.js';

export const core = {
    // https://forth-standard.org/standard/core/Times
    '*': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const n3 = new Cell(n1.toUnsigned() * n2.toUnsigned());
            this.dataStack.push(n3);
        }
    },
    // https://forth-standard.org/standard/core/Plus
    '+': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const n3 = new Cell(n1.toUnsigned() + n2.toUnsigned());
            this.dataStack.push(n3);
        }
    },
    // https://forth-standard.org/standard/core/Minus
    '-': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const n3 = new Cell(n1.toUnsigned() - n2.toUnsigned());
            this.dataStack.push(n3);
        }
    },
    // https://forth-standard.org/standard/core/Div
    '/': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const dividend = n1.toSigned();
            const divisor = n2.toSigned();
            if (divisor === 0n) {
                this.resetFVM();
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
        }
    },
    // https://forth-standard.org/standard/core/DivMOD
    '/MOD': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const dividend = n1.toSigned();
            const divisor = n2.toSigned();
            if (divisor === 0n) {
                this.resetFVM();
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
        }
    },
    // https://forth-standard.org/standard/core/MOD
    'MOD': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const dividend = n1.toSigned();
            const divisor = n2.toSigned();
            if (divisor === 0n) {
                this.resetFVM();
                throw new errors.OperationError(errors.ErrorMessages.DIV_BY_ZERO);
            }
            // Forth uses floored division (rounds toward negative infinity) 
            let remainder = dividend % divisor;
            if (remainder !== 0n && ((remainder > 0n && divisor < 0n) || (remainder < 0n && divisor > 0n))) {
                remainder += divisor;
            }
            const n3 = new Cell(remainder);
            this.dataStack.push(n3);
        }
    },
    // https://forth-standard.org/standard/core/ABS
    'ABS': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const n = this.dataStack.pop();
            const abs = n.toSigned() < 0n ? -n.toSigned() : n.toSigned();
            const u = new Cell(abs);
            this.dataStack.push(u);
        }
    },
    // https://forth-standard.org/standard/core/OneMinus
    '1-': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const n1 = this.dataStack.pop();
            const n2 = new Cell(n1.toUnsigned() - 1n);
            this.dataStack.push(n2);
        }
    },
    // https://forth-standard.org/standard/core/OnePlus
    '1+': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const n1 = this.dataStack.pop();
            const n2 = new Cell(n1.toUnsigned() + 1n);
            this.dataStack.push(n2);
        }
    },
    // https://forth-standard.org/standard/core/NEGATE
    'NEGATE': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const n1 = this.dataStack.pop();
            const n2 = new Cell(-n1.toSigned());
            this.dataStack.push(n2);
        }
    },
    // https://forth-standard.org/standard/core/MIN
    'MIN': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const min = n1.toSigned() < n2.toSigned() ? n1.toSigned() : n2.toSigned();
            const n3 = new Cell(min);
            this.dataStack.push(n3);
        }
    },
    // https://forth-standard.org/standard/core/MAX
    'MAX': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const max = n1.toSigned() > n2.toSigned() ? n1.toSigned() : n2.toSigned();
            const n3 = new Cell(max);
            this.dataStack.push(n3);
        }
    },
    // https://forth-standard.org/standard/core/DROP
    'DROP': {
        'flags': [],
        'entry': function(){ // tested
            this.checkStackUnderflow(1);
            this.dataStack.pop();
        }
    },
    // https://forth-standard.org/standard/core/DUP
    'DUP': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const w = this.dataStack[this.dataStack.length - 1];
            this.dataStack.push(w);
        }
    },
    // https://forth-standard.org/standard/core/OVER
    'OVER': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const w1 = this.dataStack[this.dataStack.length - 2];
            this.dataStack.push(w1);
        }
    },
    // https://forth-standard.org/standard/core/SWAP
    'SWAP': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push(w2, w1);
        }
    },
    // https://forth-standard.org/standard/core/ROT
    'ROT': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(3);
            const w3 = this.dataStack.pop();
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push(w2, w3, w1);
        }
    },
    // https://forth-standard.org/standard/core/qDUP
    '?DUP': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const topNumber = this.dataStack[this.dataStack.length - 1];
            if (topNumber.toNumber() !== 0) {
                this.dataStack.push(topNumber);
            }
        }
    },
    // https://forth-standard.org/standard/core/TwoDROP
    '2DROP': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            this.dataStack.pop(); // w2
            this.dataStack.pop(); // w1
        }
    },
    // https://forth-standard.org/standard/core/TwoDUP
    '2DUP': {
        'flags': [],
        'entry': function() { //tested
            this.checkStackUnderflow(2);
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push(w1, w2, w1, w2);
        }
    },
    // https://forth-standard.org/standard/core/TwoOVER
    '2OVER': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(4);
            const len = this.dataStack.length
            const w1 = this.dataStack[len - 4];
            const w2 = this.dataStack[len - 3];
            this.dataStack.push(w1, w2);
        }
    },
    // https://forth-standard.org/standard/core/TwoSWAP
    '2SWAP': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(4);
            const w4 = this.dataStack.pop();
            const w3 = this.dataStack.pop();
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push (
                w3, w4, w1, w2
            );
        }
    },
    // https://forth-standard.org/standard/core/d
    '.': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const w1 = this.dataStack.pop();
            this.output = `${w1.toSigned()}`;
        }
    },
    // https://forth-standard.org/standard/core/Equal
    '=': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const flag = (n1.toUnsigned() === n2.toUnsigned()) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/less
    '<': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const flag = (n1.toSigned() < n2.toSigned()) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/more
    '>': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const flag = (n1.toSigned() > n2.toSigned()) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/Uless
    'U<': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const u2 = this.dataStack.pop();
            const u1 = this.dataStack.pop();
            const flag = (u1.toUnsigned() < u2.toUnsigned()) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/ZeroEqual
    '0=': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const n = this.dataStack.pop();
            const flag = (n.toUnsigned() === 0n) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/Zeroless
    '0<': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const n = this.dataStack.pop();
            const flag = (n.toSigned() < 0) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/TwoTimes
    '2*': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const x1 = this.dataStack.pop();
            const x2 = new Cell(x1.toUnsigned() << 1n);
            this.dataStack.push(x2);
        }
    },
    // https://forth-standard.org/standard/core/TwoDiv
    '2/': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const x1 = this.dataStack.pop();
            const x2 = new Cell(x1.toUnsigned() >> 1n);
            this.dataStack.push(x2);
        }
    },
    // https://forth-standard.org/standard/core/AND
    'AND': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const x2 = this.dataStack.pop();
            const x1 = this.dataStack.pop();
            const x3 = new Cell(x1.toUnsigned() & x2.toUnsigned());
            this.dataStack.push(x3);
        }
    },
    // https://forth-standard.org/standard/core/OR
    'OR': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const x2 = this.dataStack.pop();
            const x1 = this.dataStack.pop();
            const x3 = new Cell(x1.toUnsigned() | x2.toUnsigned());
            this.dataStack.push(x3);
        }
    },
    // https://forth-standard.org/standard/core/XOR
    'XOR': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const x2 = this.dataStack.pop();
            const x1 = this.dataStack.pop();
            const x3 = new Cell(x1.toUnsigned() ^ x2.toUnsigned());
            this.dataStack.push(x3);
        }
    },
    // https://forth-standard.org/standard/core/INVERT
    'INVERT': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const x1 = this.dataStack.pop();
            const x2 = new Cell(~x1.toUnsigned());
            this.dataStack.push(x2);
        }
    },
    // https://forth-standard.org/standard/core/LSHIFT
    'LSHIFT': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const u = this.dataStack.pop();
            const x1 = this.dataStack.pop();
            // Wrap shift amount to 0-63 range (modulo 64)
            const shiftAmount = u.toUnsigned() & 63n;
            const x2 = new Cell(x1.toUnsigned() << shiftAmount);
            this.dataStack.push(x2);
        }
    },
    // https://forth-standard.org/standard/core/RSHIFT
    'RSHIFT': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const u = this.dataStack.pop();
            const x1 = this.dataStack.pop();
            // Wrap shift amount to 0-63 range (modulo 64)
            const shiftAmount = u.toUnsigned() & 63n;
            const x2 = new Cell(x1.toUnsigned() >> shiftAmount);
            this.dataStack.push(x2);
        }
    },
    // https://forth-standard.org/standard/core/Ud
    'U.': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const u1 = this.dataStack.pop();
            this.output = `${u1.toUnsigned()}`;
        }
    },
    // https://forth-standard.org/standard/core/StoD
    'S>D': {
        'flags': [],
        'entry': function() {
            this.checkStackUnderflow(1);
            const n = this.dataStack.pop();
            const signedValue = n.toSigned();
            const lowPart = new Cell(signedValue & 0xFFFFFFFFFFFFFFFFn);
            const highPart = new Cell((signedValue >> 64n) & 0xFFFFFFFFFFFFFFFFn);
            this.dataStack.push(lowPart);
            this.dataStack.push(highPart);
        }
    },
    // https://forth-standard.org/standard/core/TimesDiv
    '*/': {
        'flags': [],
        'entry': function() {
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
                this.resetFVM();
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
        }
    },
    // https://forth-standard.org/standard/core/TimesDivMOD
    '*/MOD': {
        'flags': [],
        'entry': function() {
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
                this.resetFVM();
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
        }
    },
    // https://forth-standard.org/standard/core/DEPTH
    'DEPTH': {
        'flags': [],
        'entry': function() {
            const n = new Cell(this.dataStack.length);
            this.dataStack.push(n);
        }
    },
    // https://forth-standard.org/standard/core/Colon
    ':': {
        'flags': [types.FlagTypes.DEFINING_WORD],
        'entry': function () {
            const frame = this.executionStack[this.executionStack.length - 1];
            if (this.state === types.ForthState.COMPILE) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.NESTED_DEFINITION);
            }
            if (frame.index >= frame.words.length) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
            }
            const wordName = frame.words[frame.index++].name;
            if (!this.isValidWordName(wordName)) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.INVALID_WORD_NAME);
            }
            // TODO: A program shall not create definition names containing non-graphic characters. 
            this.compilingWord = wordName; // temporarily hold the word being defined
            this.compilationBuffer = []; // array of Word instances
            this.state = types.ForthState.COMPILE;
        }
    },
    // https://forth-standard.org/standard/core/Semi
    ';': {
        'flags': [types.FlagTypes.IMMEDIATE, types.FlagTypes.COMPILE_ONLY],
        'entry': function () {
            // theres an unclosed control structure
            // IF/ELSE without a THEN 
            if (this.controlStack.length > 0) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.UNMATCHED_CONTROL_STRUCTURE);
            }
            if (this.isWordRedefined(this.compilingWord)) {
                this.output = `redefined ${this.compilingWord}`;
            }
            const code = this.compilationBuffer;
            this.words[this.compilingWord] = {
                'flags': [],
                'entry': function() {
                    this.execute(code);
                }
            };
            console.log(`Defined word: ${this.compilingWord}`);
            console.log(`${code.map(w => w.name).join(' ')}`);    
            this.compilingWord = '';
            this.compilationBuffer = [];
            this.state = types.ForthState.INTERPRET;
        }
    },
    // https://forth-standard.org/standard/core/VARIABLE
    'VARIABLE': {
        'flags': [types.FlagTypes.DEFINING_WORD],
        'entry': function () {
            const frame = this.executionStack[this.executionStack.length - 1];
            if (frame.index >= frame.words.length) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
            }
            const varName = frame.words[frame.index++].name;

            if (!this.isValidWordName(varName)) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.ZERO_LENGTH_NAME);
            }

            if (this.isWordRedefined(varName)) {
                this.output = `redefined ${varName}`;
            }

            const address = this.memory.allocate();

            this.words[varName] = {
                'flags': [],
                'entry': function() {
                    this.dataStack.push(new Cell(address));
                }
            };
        }
    },
    // https://forth-standard.org/standard/core/Store
    '!': {
        'flags': [],
        'entry': function() {
            this.checkStackUnderflow(2);
            const addressCell = this.dataStack.pop();
            const valueCell = this.dataStack.pop();
            const address = addressCell.toUnsigned();
            if (!this.memory.has(address)) {
                this.resetFVM();
                throw new errors.OperationError(errors.ErrorMessages.INVALID_MEMORY_ACCESS);
            }
            this.memory.store(address, valueCell);
        }
    },
    // https://forth-standard.org/standard/core/Fetch
    '@': {
        'flags': [],
        'entry': function() {
            this.checkStackUnderflow(1);
            const addressCell = this.dataStack.pop();
            const address = addressCell.toUnsigned();
            if (!this.memory.has(address)) {
                this.resetFVM();
                throw new errors.OperationError(errors.ErrorMessages.INVALID_MEMORY_ACCESS);
            }
            const valueCell = this.memory.fetch(address);
            this.dataStack.push(valueCell);
        }
    },
    // https://forth-standard.org/standard/core/IF
    'IF': {
        'flags': [types.FlagTypes.IMMEDIATE, types.FlagTypes.COMPILE_ONLY],
        'entry': function() {
            const zeroBranch = new Word('0BRANCH', this.words['0BRANCH'].entry, []);
            const offsetPlaceholder = new NumberWord('0', new Cell(0n));
            this.compilationBuffer.push(offsetPlaceholder, zeroBranch);
            this.controlStack.push({
                type: 'IF',
                offset: this.compilationBuffer.length - 2
            });
        }
    },
    // https://forth-standard.org/standard/core/ELSE
    'ELSE': {
        'flags': [types.FlagTypes.IMMEDIATE, types.FlagTypes.COMPILE_ONLY],
        'entry': function() {
            const currentControl = this.controlStack.pop();
            if (!currentControl) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.CONTROL_EXPECTED);
            }
            const branch = new Word('BRANCH', this.words['BRANCH'].entry, []);
            const offsetPlaceholder = new NumberWord('0', new Cell(0n));
            this.compilationBuffer.push(offsetPlaceholder, branch);

            const skipDistance = this.compilationBuffer.length - currentControl.offset - 1;
            this.compilationBuffer[currentControl.offset] = new NumberWord(
                String(skipDistance),
                new Cell(skipDistance)
            );

            this.controlStack.push({
                type: 'ELSE',
                offset: this.compilationBuffer.length - 2
            });
        }
    },
    // https://forth-standard.org/standard/core/THEN
    'THEN': {
        'flags': [types.FlagTypes.IMMEDIATE, types.FlagTypes.COMPILE_ONLY],
        'entry': function() {
            const currentControl = this.controlStack.pop();
            if (!currentControl) {
                this.errorReset();
                throw new errors.ParseError(errors.ErrorMessages.CONTROL_EXPECTED);
            }
            const skipDistance = this.compilationBuffer.length - currentControl.offset - 1;
            this.compilationBuffer[currentControl.offset] = new NumberWord(
                String(skipDistance),
                new Cell(skipDistance)
            );
        }
    },
    '0BRANCH': {
        'flags': [],
        'entry': function() {}
    },
    'BRANCH': {
        'flags': [],
        'entry': function() {}
    }
};