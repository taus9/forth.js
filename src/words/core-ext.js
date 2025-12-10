import { Cell } from '../types/cell.js';
import * as errors from '../errors/errors.js';

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
            // testing on gForth PICK does something I don't understand yet
            // it seems to allow negative numbers even though the standard
            // shows only unsigned numbers: ( xu...x1 x0 u -- xu...x1 x0 xu )
            // -1 PICK duplicates the top stack item            
            this.checkStackUnderflow(1);
            const u = this.dataStack.pop();
            this.checkStackUnderflow(u.toNumber() + 1);
            if (u.toNumber() < 0) {
                this.errorReset();
                throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
            }
            const xu = this.dataStack[(this.dataStack.length - 1) - u.toNumber()];
            this.dataStack.push(xu);
        }
    },
    // https://forth-standard.org/standard/core/ROLL
    'ROLL': {
        'flags': [],
        'entry': function() { // tested
            this.checkStackUnderflow(1);
            const u = this.dataStack.pop();
            this.checkStackUnderflow(u.toNumber() + 1);
            if (u.toNumber() < 0) {
                this.errorReset();
                throw new errors.StackError(errors.ErrorMessages.STACK_UNDERFLOW);
            }
            const targetIndex = this.dataStack.length - 1 - u.toNumber();
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