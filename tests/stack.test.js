#!/usr/bin/env node
import { Fvm } from '../src/forth.js';
import * as errors from '../src/errors/errors.js';

export class StackTestSuite {
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
    this.put('=== dataStack words test suite ===');
    this.put('');

    // '.' and '.s'
    this.test("'.' outputs top element to fvm.output", () => {
      const fvm = new Fvm();
      fvm.execute('42 .');
      if (fvm.output !== '42') throw new Error(`Expected output '42', got '${fvm.output}'`);
    });

    this.test("'.s' shows stack count and contents", () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 .s');
      if (!fvm.output.startsWith('<3>')) throw new Error(`.s output unexpected: ${fvm.output}`);
    });

    // drop
    this.test('drop removes top element', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 drop');
      this.expectStack(fvm, [1]);
    });

    this.test('drop on empty stack throws', () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('drop'), errors.ErrorTypes.STACK);
    });

    // dup
    this.test('dup duplicates top', () => {
      const fvm = new Fvm();
      fvm.execute('5 dup');
      this.expectStack(fvm, [5,5]);
    });

    this.test('dup underflow', () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('dup'), errors.ErrorTypes.STACK);
    });

    // nip
    this.test('nip removes second-to-top', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 nip');
      this.expectStack(fvm, [2]);
    });

    this.test('nip underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('1 nip'), errors.ErrorTypes.STACK);
    });

    // over
    this.test('over copies second element to top', () => {
      const fvm = new Fvm();
      fvm.execute('7 8 over');
      this.expectStack(fvm, [7,8,7]);
    });

    this.test('over underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('over'), errors.ErrorTypes.STACK);
    });

    // tuck
    this.test('tuck inserts second element under top', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 tuck');
      this.expectStack(fvm, [2,1,2]);
    });

    this.test('tuck underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('tuck'), errors.ErrorTypes.STACK);
    });

    // swap
    this.test('swap swaps top two', () => {
      const fvm = new Fvm();
      fvm.execute('3 4 swap');
      this.expectStack(fvm, [4,3]);
    });

    this.test('swap underflow', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('1 swap'), errors.ErrorTypes.STACK);
    });

    // pick
    this.test('pick duplicates correct item', () => {
      const fvm = new Fvm();
      fvm.execute('10 20 30 2 pick');
      this.expectStack(fvm, [10,20,30,10]);
    });

    this.test('pick underflow when no index', () => {
      const fvm = new Fvm();
      this.expectError(()=>fvm.execute('pick'), errors.ErrorTypes.STACK);
    });

    // rot and -rot
    this.test('rot rotates left', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 rot');
      this.expectStack(fvm, [2,3,1]);
    });

    this.test('-rot rotates right', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 -rot');
      this.expectStack(fvm, [3,1,2]);
    });

    // ?dup
    this.test('?dup duplicates only if non-zero', () => {
      const fvm = new Fvm();
      fvm.execute('0 ?dup');
      this.expectStack(fvm, [0]);
      fvm.execute('5 ?dup');
      this.expectStack(fvm, [0,5,5]);
    });

    // roll numeric example
    this.test('roll numeric example', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2 roll');
      // stack before roll: [1,2,3,4,2] -> after roll: [1,3,4,2]
      this.expectStack(fvm, [1,3,4,2]);
    });

    // 2drop
    this.test('2drop removes two top elements', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 2drop');
      this.expectStack(fvm, [1]);
    });

    // 2nip
    this.test('2nip behavior', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2nip');
      this.expectStack(fvm, [3,4]);
    });

    // 2dup
    this.test('2dup duplicates top two', () => {
      const fvm = new Fvm();
      fvm.execute('7 8 2dup');
      this.expectStack(fvm, [7,8,7,8]);
    });

    // 2over
    this.test('2over copies two items under top four', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2over');
      this.expectStack(fvm, [1,2,3,4,1,2]);
    });

    // 2tuck
    this.test('2tuck inserts pair under top pair', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2tuck');
      this.expectStack(fvm, [3,4,1,2,3,4]);
    });

    // 2swap
    this.test('2swap swaps top two pairs', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 2swap');
      this.expectStack(fvm, [3,4,1,2]);
    });

    // 2rot
    this.test('2rot rotates top two pairs', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3 4 5 6 2rot');
      this.expectStack(fvm, [3,4,5,6,1,2]);
    });

    // Summary
    this.put('');
    this.put(`Passed: ${this.passed}, Failed: ${this.failed}`);
    return this.failed === 0;
  }
}

const suite = new StackTestSuite();
const ok = suite.run();

try {
    process.exit(ok ? 0 : 1);
} catch (e) {
    // In browser environments, process may not be defined
}
