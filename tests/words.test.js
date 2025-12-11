#!/usr/bin/env node
import { Fvm } from '../src/forth.js';
import * as errors from '../src/errors/errors.js';

export class WordsTestSuite {
  constructor(put) {
    this.put = put ?? this.consolePut;
    this.passed = 0;
    this.failed = 0;
  }

  consolePut(message) {
    console.log(message);
  }

  test(name, fn) {
    try {
      fn();
      this.put(`✓ ${name}`);
      this.passed++;
    } catch (err) {
      this.put(`✗ ${name}`);
      this.put(`  ${err.message}`);
      this.failed++;
    }
  }

  expectError(fn, expectedErrorType) {
    try {
      fn();
      throw new Error(`Expected ${expectedErrorType} but no error thrown`);
    } catch (err) {
      if (err.name !== expectedErrorType) {
        throw new Error(`Expected error ${expectedErrorType}, got ${err.name}: ${err.message}`);
      }
    }
  }

  expectStack(fvm, expected) {
    // Compare Cell objects using toNumber()
    const actualValues = fvm.dataStack.map(cell => cell.toNumber());
    const ok = actualValues.length === expected.length && 
               actualValues.every((v, i) => v === expected[i]);
    if (!ok) throw new Error(`Expected stack [${expected}] got [${actualValues}]`);
  }

  run() {
    this.put('');
    this.put('========== Words Test Suite ==========');
    this.put('');

    this.put('--- Core Words ---');
    this.put('');

    this.test("* multiplies top two stack items", () => {
      const fvm = new Fvm();
      fvm.execute('6 7 *');
      this.expectStack(fvm, [42]);
    });

    this.test("+ adds top two stack items", () => {
      const fvm = new Fvm();
      fvm.execute('19 23 +');
      this.expectStack(fvm, [42]);
    });

    this.test("- subtracts top two stack items", () => {
      const fvm = new Fvm();
      fvm.execute('100 58 -');
      this.expectStack(fvm, [42]);
    });

    this.test("/ divides second stack item by top item", () => {
      const fvm = new Fvm();
      fvm.execute('84 2 /');
      this.expectStack(fvm, [42]);
    });

    this.test("/ division by zero throws", () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('42 0 /'), errors.ErrorTypes.OPERATION);
    });
    
    this.test("/ division floors towards negative infinity", () => {
      const fvm = new Fvm();
      fvm.execute('-7 2 /');
      this.expectStack(fvm, [-4]);
    });

    this.test("MOD computes modulus", () => {
      const fvm = new Fvm();
      fvm.execute('43 10 MOD');
      this.expectStack(fvm, [3]);
    });

    this.test("/MOD computes quotient and modulus", () => {
      const fvm = new Fvm();
      fvm.execute('43 10 /MOD');
      this.expectStack(fvm, [3, 4]); // remainder 3, quotient 4
    });

    this.test("/MOD division by zero throws", () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('42 0 /MOD'), errors.ErrorTypes.OPERATION);
    });

    this.test("/MOD division floors towards negative infinity", () => {
      const fvm = new Fvm();
      fvm.execute('-7 2 /MOD');
      this.expectStack(fvm, [1, -4]); // remainder 1, quotient -4
    });

    this.test("ABS computes absolute value", () => {
      const fvm = new Fvm();
      fvm.execute('-42 ABS');
      this.expectStack(fvm, [42]);
    });

    this.test("ABS of positive number is unchanged", () => {
      const fvm = new Fvm();
      fvm.execute('42 ABS');
      this.expectStack(fvm, [42]);
    });

    this.test("1- decrements top stack item by 1", () => {
      const fvm = new Fvm();
      fvm.execute('43 1-');
      this.expectStack(fvm, [42]);
    });

    this.test("1+ increments top stack item by 1", () => {
      const fvm = new Fvm();
      fvm.execute('41 1+');
      this.expectStack(fvm, [42]);
    });

    this.test("NEGATE negates top stack item", () => {
      const fvm = new Fvm();
      fvm.execute('42 NEGATE');
      this.expectStack(fvm, [-42]);
    });

    this.test("NEGATE of negative number", () => {
      const fvm = new Fvm();
      fvm.execute('-42 NEGATE');
      this.expectStack(fvm, [42]);
    });

    this.test("MIN returns smaller of top two items", () => {
      const fvm = new Fvm();
      fvm.execute('10 42 MIN');
      this.expectStack(fvm, [10]);
    });

    this.test("MAX returns larger of top two items", () => {
      const fvm = new Fvm();
      fvm.execute('10 42 MAX');
      this.expectStack(fvm, [42]);
    });

    // '.'
    this.test("'.' outputs top element to fvm.output", () => {
      const fvm = new Fvm();
      fvm.execute('42 .');
      if (fvm.getOutput() !== '42') throw new Error(`Expected output '42', got '${fvm.getOutput()}'`);
    });

    // DROP
    this.test('DROP removes top element', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 DROP');
      this.expectStack(fvm, [1]);
    });

    this.test('DROP on empty stack throws', () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('DROP'), errors.ErrorTypes.STACK);
    });

    // DUP
    this.test('DUP duplicates top', () => {
      const fvm = new Fvm();
      fvm.execute('5 DUP');
      this.expectStack(fvm, [5,5]);
    });

    this.test('DUP underflow', () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('DUP'), errors.ErrorTypes.STACK);
    });

    // OVER
    this.test('OVER copies second element to top', () => {
      const fvm = new Fvm();
      fvm.execute('7 8 OVER');
      this.expectStack(fvm, [7,8,7]);
    });

    this.test('OVER underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('OVER'), errors.ErrorTypes.STACK);
    });

    // SWAP
    this.test('SWAP swaps top two', () => {
      const fvm = new Fvm();
      fvm.execute('3 4 SWAP');
      this.expectStack(fvm, [4,3]);
    });

    this.test('SWAP underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('1 SWAP'), errors.ErrorTypes.STACK);
    });

    // ROT
    this.test('ROT rotates left', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 ROT');
      this.expectStack(fvm, [2,3,1]);
    });

    // ?DUP
    this.test('?DUP duplicates only if non-zero', () => {
      const fvm = new Fvm();
      fvm.execute('0 ?DUP');
      this.expectStack(fvm, [0]);
      fvm.execute('5 ?DUP');
      this.expectStack(fvm, [0,5,5]);
    });

    // 2DROP
    this.test('2DROP removes two top elements', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 2DROP');
      this.expectStack(fvm, [1]);
    });

    // 2DUP
    this.test('2DUP duplicates top two', () => {
      const fvm = new Fvm();
      fvm.execute('7 8 2DUP');
      this.expectStack(fvm, [7,8,7,8]);
    });

    // 2OVER
    this.test('2OVER copies two items under top four', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2OVER');
      this.expectStack(fvm, [1,2,3,4,1,2]);
    });

    // 2SWAP
    this.test('2SWAP swaps top two pairs', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2SWAP');
      this.expectStack(fvm, [3,4,1,2]);
    });

    // =
    this.test('= returns true flag when equal', () => {
      const fvm = new Fvm();
      fvm.execute('42 42 =');
      this.expectStack(fvm, [-1]);
    });

    this.test('= returns false flag when not equal', () => {
      const fvm = new Fvm();
      fvm.execute('42 43 =');
      this.expectStack(fvm, [0]);
    });

    // <
    this.test('< returns true when n1 < n2', () => {
      const fvm = new Fvm();
      fvm.execute('5 10 <');
      this.expectStack(fvm, [-1]);
    });

    this.test('< returns false when n1 >= n2', () => {
      const fvm = new Fvm();
      fvm.execute('10 5 <');
      this.expectStack(fvm, [0]);
    });

    this.test('< handles negative numbers', () => {
      const fvm = new Fvm();
      fvm.execute('-5 0 <');
      this.expectStack(fvm, [-1]);
    });

    // >
    this.test('> returns true when n1 > n2', () => {
      const fvm = new Fvm();
      fvm.execute('10 5 >');
      this.expectStack(fvm, [-1]);
    });

    this.test('> returns false when n1 <= n2', () => {
      const fvm = new Fvm();
      fvm.execute('5 10 >');
      this.expectStack(fvm, [0]);
    });

    // U<
    this.test('U< compares unsigned values', () => {
      const fvm = new Fvm();
      fvm.execute('5 10 U<');
      this.expectStack(fvm, [-1]);
    });

    this.test('U< treats negative as large unsigned', () => {
      const fvm = new Fvm();
      fvm.execute('-1 10 U<');
      this.expectStack(fvm, [0]); // -1 as unsigned is very large
    });

    // 0=
    this.test('0= returns true for zero', () => {
      const fvm = new Fvm();
      fvm.execute('0 0=');
      this.expectStack(fvm, [-1]);
    });

    this.test('0= returns false for non-zero', () => {
      const fvm = new Fvm();
      fvm.execute('42 0=');
      this.expectStack(fvm, [0]);
    });

    // 0<
    this.test('0< returns true for negative', () => {
      const fvm = new Fvm();
      fvm.execute('-5 0<');
      this.expectStack(fvm, [-1]);
    });

    this.test('0< returns false for zero and positive', () => {
      const fvm = new Fvm();
      fvm.execute('0 0<');
      this.expectStack(fvm, [0]);
      fvm.execute('5 0<');
      this.expectStack(fvm, [0, 0]);
    });

    // 2*
    this.test('2* multiplies by 2 via left shift', () => {
      const fvm = new Fvm();
      fvm.execute('21 2*');
      this.expectStack(fvm, [42]);
    });

    // 2/
    this.test('2/ divides by 2 via right shift', () => {
      const fvm = new Fvm();
      fvm.execute('84 2/');
      this.expectStack(fvm, [42]);
    });

    // AND
    this.test('AND performs bitwise AND', () => {
      const fvm = new Fvm();
      fvm.execute('12 10 AND');
      this.expectStack(fvm, [8]); // 1100 & 1010 = 1000
    });

    // OR
    this.test('OR performs bitwise OR', () => {
      const fvm = new Fvm();
      fvm.execute('12 10 OR');
      this.expectStack(fvm, [14]); // 1100 | 1010 = 1110
    });

    // XOR
    this.test('XOR performs bitwise XOR', () => {
      const fvm = new Fvm();
      fvm.execute('12 10 XOR');
      this.expectStack(fvm, [6]); // 1100 ^ 1010 = 0110
    });

    // INVERT
    this.test('INVERT performs bitwise NOT', () => {
      const fvm = new Fvm();
      fvm.execute('0 INVERT');
      this.expectStack(fvm, [-1]); // All bits set
    });

    this.test('INVERT -1 gives 0', () => {
      const fvm = new Fvm();
      fvm.execute('-1 INVERT');
      this.expectStack(fvm, [0]);
    });

    // LSHIFT
    this.test('LSHIFT shifts left by specified bits', () => {
      const fvm = new Fvm();
      fvm.execute('5 2 LSHIFT');
      this.expectStack(fvm, [20]); // 0101 << 2 = 10100
    });

    this.test('LSHIFT wraps shift amount modulo 64', () => {
      const fvm = new Fvm();
      fvm.execute('3 64 LSHIFT');
      this.expectStack(fvm, [3]); // 64 mod 64 = 0, no shift
    });

    this.test('LSHIFT with wrapped amount', () => {
      const fvm = new Fvm();
      fvm.execute('5 65 LSHIFT');
      this.expectStack(fvm, [10]); // 65 mod 64 = 1, shift by 1
    });

    // RSHIFT
    this.test('RSHIFT shifts right by specified bits', () => {
      const fvm = new Fvm();
      fvm.execute('20 2 RSHIFT');
      this.expectStack(fvm, [5]); // 10100 >> 2 = 0101
    });

    this.test('RSHIFT wraps shift amount modulo 64', () => {
      const fvm = new Fvm();
      fvm.execute('3 64 RSHIFT');
      this.expectStack(fvm, [3]); // 64 mod 64 = 0, no shift
    });

    // U.
    this.test("U. outputs unsigned value", () => {
      const fvm = new Fvm();
      fvm.execute('42 U.');
      if (fvm.output !== '42') throw new Error(`Expected output '42', got '${fvm.output}'`);
    });

    this.test("U. displays negative as large unsigned", () => {
      const fvm = new Fvm();
      fvm.execute('-1 U.');
      if (fvm.output !== '18446744073709551615') throw new Error(`Expected output '18446744073709551615', got '${fvm.output}'`);
    });

    this.put('');
    this.put('--- Core Ext Words ---');
    this.put('');

    // NIP
    this.test('NIP removes second-to-top', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 NIP');
      this.expectStack(fvm, [2]);
    });

    this.test('NIP underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('1 NIP'), errors.ErrorTypes.STACK);
    });

    // TUCK
    this.test('TUCK inserts second element under top', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 TUCK');
      this.expectStack(fvm, [2,1,2]);
    });

    this.test('TUCK underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('TUCK'), errors.ErrorTypes.STACK);
    });

    // PICK
    this.test('PICK duplicates correct item', () => {
      const fvm = new Fvm();
      fvm.execute('10 20 30 2 PICK');
      this.expectStack(fvm, [10,20,30,10]);
    });

    this.test('PICK underflow when no index', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('PICK'), errors.ErrorTypes.STACK);
    });

        // ROLL numeric example
    this.test('ROLL numeric example', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2 ROLL');
      this.expectStack(fvm, [1,3,4,2]);
    });

    this.put('');
    this.put('--- Misc Words ---');
    this.put('');

    // .S
    this.test("'.S' shows stack count and contents", () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 .S');
      if (!fvm.output.startsWith('<3>')) throw new Error(`.S output unexpected: ${fvm.output}`);
    });

    // -ROT
    this.test('-ROT rotates right', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 -ROT');
      this.expectStack(fvm, [3,1,2]);
    });
    
    // 2NIP
    this.test('2NIP behavior', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2NIP');
      this.expectStack(fvm, [3,4]);
    });

    // 2TUCK
    this.test('2TUCK inserts pair under top pair', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2TUCK');
      this.expectStack(fvm, [3,4,1,2,3,4]);
    });

    // 2ROT
    this.test('2ROT rotates top two pairs', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 5 6 2ROT');
      this.expectStack(fvm, [3,4,5,6,1,2]);
    });

    // Summary
    this.put('');
    this.put(`***** Passed: ${this.passed}, Failed: ${this.failed} *****`);
    return this.failed === 0;
  }
}

const suite = new WordsTestSuite();
const ok = suite.run();

try {
    process.exit(ok ? 0 : 1);
} catch (e) {
    // In browser environments, process may not be defined
}