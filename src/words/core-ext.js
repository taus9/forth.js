import * as types from '../types/types.js';

export const coreExt = {
    // https://forth-standard.org/standard/core/NIP
    'NIP': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const w2 = this.dataStack.pop();
            this.dataStack.pop(); // w1
            this.dataStack.push(w2);
        } 
    },
    // https://forth-standard.org/standard/core/TUCK
    'TUCK': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(2);
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push(w2, w1, w2);
        }
    },
    // https://forth-standard.org/standard/core/PICK
    'PICK': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const topNumber = this.dataStack.pop();
            this.checkStackUnderflow(topNumber.toNumber());
            const pickedNumber = this.dataStack[(this.dataStack.length - 1) - topNumber.toNumber()];
            this.dataStack.push(pickedNumber);
        }
    },
    // https://forth-standard.org/standard/core/ROLL
    'ROLL': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const rollAmount = this.dataStack.pop();
            this.checkStackUnderflow(rollAmount.toNumber());
            const targetIndex = this.dataStack.length - 1 - rollAmount.toNumber();
            const target = this.dataStack.splice(targetIndex, 1);
            this.dataStack.push(target[0]);
        }
    },
    // https://forth-standard.org/standard/core/ne
    '<>': {
        'flags': [],
        'entry': function() {
            this.checkStackUnderflow(2);
            const n2 = this.dataStack.pop();
            const n1 = this.dataStack.pop();
            const flag = (n1.toUnsigned() !== n2.toUnsigned()) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    },
    // https://forth-standard.org/standard/core/Umore
    'U>': {
        'flags': [],
        'entry': function() {
            this.checkStackUnderflow(2);
            const u2 = this.dataStack.pop();
            const u1 = this.dataStack.pop();
            const flag = (u1.toUnsigned() > u2.toUnsigned()) ? -1 : 0;
            this.dataStack.push(new Cell(flag));
        }
    }

}