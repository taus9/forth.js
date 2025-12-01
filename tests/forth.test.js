import { Fvm } from '../forth/forth.js';
import * as types from '../forth/types/types.js';


export class FvmTestSuite {

    constructor(fvm, put) {
        this.fvm = fvm;
        this.put = put;
        this.message = '';
    }

    expectEqual(actual, expected, message) {
        if (actual !== expected) {
            this.message = `Assertion Failed: ${message}\nExpected: ${expected}, got: ${actual}`;
            return false;
        }
        return true;
    }

    expectDataStackEqual(expected, message) {
        this.put(message);
        const equal = 
            this.fvm.dataStack.length === expected.length && 
            this.fvm.dataStack.every((v,i) => v === expected[i]);
        
        if (!equal) {
            this.put(`Assertion Failed: ${message}\nExpected: [${expected}], got: [${this.fvm.dataStack}]\n`);
        } else {
            this.put('passed');
            this.fvm.execute('.s');
            this.put(`${this.fvm.output}\n`);
        }
    }
    
    runTestSuite() {
        this.put('--- Number and Math Words ---\n');
        
        this.fvm.execute('3 4 +');
        this.expectDataStackEqual([7], '3 4 + should push 7');
    
        this.fvm.execute('10 2 -');
        this.expectDataStackEqual([7,8], '10 2 - should push 8');
    
        this.fvm.execute('2 3 *');
        this.expectDataStackEqual([7,8,6], '2 3 * should push 6');

        this.fvm.execute('8 2 /');
        this.expectDataStackEqual([7,8,6,4], '8 2 / should push 4');

        this.fvm.execute('2 3 **');
        this.expectDataStackEqual([7,8,6,4,8], '2 3 ** should push 8');
    
        this.fvm.execute('10 3 %');
        this.expectDataStackEqual([7,8,6,4,8,1], '10 3 % should push 1');

        this.put('--- Stack manipulation ---');

        this.fvm.execute('dup');
        this.expectDataStackEqual([7,8,6,4,8,1,1], 'dup duplicates top element');

        this.fvm.execute('drop');
        this.expectDataStackEqual([7,8,6,4,8,1], 'drop removes top element');

        this.fvm.execute('swap');
        this.expectDataStackEqual([7,8,6,4,1,8], 'swap swaps top two elements');

        this.fvm.execute('over');
        this.expectDataStackEqual([7,8,6,4,1,8,1], 'over copies second element to top');

        this.fvm.execute('nip');
        this.expectDataStackEqual([7,8,6,4,1,1], 'nip removes second-to-top element');

        this.fvm.execute('tuck');
        this.expectDataStackEqual([7,8,6,4,1,1,1], 'tuck inserts second element under top');

        this.put('pushing 3 on to the stack');
        this.fvm.execute('3 .s');
        this.put(`${this.fvm.output}\n`);
                
        this.fvm.execute('pick');
        this.expectDataStackEqual([7,8,6,4,1,1,1,4], 'pick - duplicate correct item from the stack to the top.');
        
        this.fvm.execute('roll');
        this.expectDataStackEqual([7,8,4,1,1,1,6], 'roll - x0 x1 .. xn n – x1 .. xn x0');

        this.put('pushing 0 on to the stack');
        this.fvm.execute('0 .s');
        this.put(`${this.fvm.output}\n`);

        this.fvm.execute('?dup');
        this.expectDataStackEqual([7,8,4,1,1,1,6,0], '?dup does nothing for zero');

        this.put('pushing 5 on to the stack');
        this.fvm.execute('5 .s');
        this.put(`${this.fvm.output}\n`);

        this.fvm.execute('?dup');
        this.expectDataStackEqual([7,8,4,1,1,1,6,0,5,5], '?dup dups for non-zero');
        
        this.fvm.execute('rot');
        this.expectDataStackEqual([7,8,4,1,1,1,6,5,5,0], 'rot: w1 w2 w3 – w2 w3 w1');
        
        this.fvm.execute('-rot');
        this.expectDataStackEqual([7,8,4,1,1,1,6,0,5,5], '-rot: w1 w2 w3 – w3 w1 w2');
        
        this.fvm.execute('2drop');
        this.expectDataStackEqual([7,8,4,1,1,1,6,0], '2drop: removes top 2 elements');
        
        this.fvm.execute('2nip');
        this.expectDataStackEqual([7,8,4,1,6,0], '2nip: removes 2 elements below the top 2 on stack');
        
        this.fvm.execute('2rot');
        this.expectDataStackEqual([4,1,6,0,7,8], '2rot rotates top two pairs');
        
        this.fvm.execute('2swap');
        this.expectDataStackEqual([4,1,7,8,6,0], '2swap swaps top two pairs');
        
        this.fvm.execute('2tuck');
        this.expectDataStackEqual([4,1,6,0,7,8,6,0], '2tuck: w1 w2 w3 w4 – w3 w4 w1 w2 w3 w4');    
        
        this.fvm.execute('2over');
        this.expectDataStackEqual([4,1,6,0,7,8,6,0,7,8], '2over: w1 w2 w3 w4 – w1 w2 w3 w4 w1 w2');
        
        this.fvm.execute('2dup');
        this.expectDataStackEqual([4,1,6,0,7,8,6,0,7,8,7,8], '2dup: w1 w2 – w1 w2 w1 w2');

/*

    // --- Stack underflow errors ---
    vm.dataStack = [];
    let err = runForth(vm, 'drop');
    expectEqual(err.name, 'StackError', 'drop on empty stack throws StackError');

    vm.dataStack = [];
    err = runForth(vm, '+');
    expectEqual(err.name, 'StackError', 'math op with <2 items throws StackError');
    }
*/

    }
}
