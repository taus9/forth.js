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

    expectArrayEqual(actual, expected, message) {
        this.put(message);
        const equal = actual.length === expected.length && actual.every((v,i) => v === expected[i]);
        if (!equal) {
            this.put(`Assertion Failed: ${message}\nExpected: [${expected}], got: [${actual}]`);
        } else {
            this.put('passed');
        }
    }
    
    runTestSuite() {
        this.put('--- Number and Math Words ---\n');
        
        this.fvm.execute('3 4 +');
        this.expectArrayEqual(this.fvm.dataStack, [7], '3 4 + should push 7');
    
        this.fvm.execute('10 2 -');
        this.expectArrayEqual(this.fvm.dataStack, [8], '10 2 - should push 8');
    
        this.fvm.execute('2 3 *');
        this.expectArrayEqual(this.fvm.dataStack, [6], '2 3 * should push 6');

        this.fvm.execute('8 2 /');
        this.expectArrayEqual(this.fvm.dataStack, [4], '8 2 / should push 4');

        this.fvm.execute('2 3 **');
        this.expectArrayEqual(this.fvm.dataStack, [8], '2 3 ** should push 8');
    
        this.fvm.execute('10 3 %');
        this.expectArrayEqual(this.fvm.dataStack, [1], '10 3 % should push 1');
/*
    // --- Stack manipulation ---

    // reset stack
    vm.dataStack = [1,2,3];

    // dup
    runForth(vm, 'dup');
    expectArrayEqual(vm.dataStack, [1,2,3,3], 'dup duplicates top element');

    // drop
    runForth(vm, 'drop');
    expectArrayEqual(vm.dataStack, [1,2,3], 'drop removes top element');

    // swap
    runForth(vm, 'swap');
    expectArrayEqual(vm.dataStack, [1,3,2], 'swap swaps top two elements');

    // over
    runForth(vm, 'over');
    expectArrayEqual(vm.dataStack, [1,3,2,3], 'over copies second element to top');

    // nip
    runForth(vm, 'nip');
    expectArrayEqual(vm.dataStack, [1,3,3], 'nip removes second-to-top element');

    // tuck
    runForth(vm, 'tuck');
    expectArrayEqual(vm.dataStack, [1,3,3,3], 'tuck inserts second element under top');

    // pick
    vm.dataStack = [10,20,30,1]; // 1 pick = push 2nd element from top (20)
    runForth(vm, 'pick');
    expectArrayEqual(vm.dataStack, [10,20,30,1,20], 'pick works correctly');

    // roll
    vm.dataStack = [1,2,3,4,2]; // roll top 2 = move 3rd from top to top
    runForth(vm, 'roll');
    expectArrayEqual(vm.dataStack, [1,2,4,3], 'roll works correctly');

    // ?dup
    vm.dataStack = [0];
    runForth(vm, '?dup');
    expectArrayEqual(vm.dataStack, [0], '?dup does nothing for zero');

    vm.dataStack = [5];
    runForth(vm, '?dup');
    expectArrayEqual(vm.dataStack, [5,5], '?dup duplicates non-zero');

    // --- 2-operations ---
    vm.dataStack = [1,2];
    runForth(vm, '2dup');
    expectArrayEqual(vm.dataStack, [1,2,1,2], '2dup duplicates top two elements');

    vm.dataStack = [1,2,3,4];
    runForth(vm, '2swap');
    expectArrayEqual(vm.dataStack, [3,4,1,2], '2swap swaps top two pairs');

    vm.dataStack = [1,2,3,4,5,6];
    runForth(vm, '2rot');
    expectArrayEqual(vm.dataStack, [3,4,5,6,1,2], '2rot rotates top two pairs');

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
