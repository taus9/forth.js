#!/usr/bin/env node
import { Fvm } from '../src/forth.js';
import * as errors from '../src/errors/errors.js';

export class CompileTestSuite {
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
    this.put('=== Colon Definitions Test Suite ===');
    this.put('');

    // Basic definition
    this.test('Define and execute simple word', () => {
      const fvm = new Fvm();
      fvm.execute(': double 2 * ;');
      fvm.execute('5 double');
      this.expectStack(fvm, [10]);
    });

    this.test('Define word using existing words', () => {
      const fvm = new Fvm();
      fvm.execute(': square dup * ;');
      fvm.execute('7 square');
      this.expectStack(fvm, [49]);
    });

    this.test('Multiple definitions', () => {
      const fvm = new Fvm();
      fvm.execute(': double 2 * ;');
      fvm.execute(': quadruple double double ;');
      fvm.execute('3 quadruple');
      this.expectStack(fvm, [12]);
    });

    this.test('Definition with multiple operations', () => {
      const fvm = new Fvm();
      fvm.execute(': add-and-double + 2 * ;');
      fvm.execute('3 4 add-and-double');
      this.expectStack(fvm, [14]);
    });

    // Error cases
    this.test('Error on ; without :', () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute('5 3 ;'), errors.ErrorTypes.INTERPRETER);
    });

    this.test('Error on : without name', () => {
      const fvm = new Fvm();
      this.expectError(() => fvm.execute(': ;'), errors.ErrorTypes.PARSE);
    });

    // Multi-line definitions (unterminated is OK until ; is received)
    this.test('Definition can span multiple execute calls', () => {
      const fvm = new Fvm();
      fvm.execute(': test 1 2 +');
      // Should be in compile state, not error
      fvm.execute('3 * ;');
      fvm.execute('test');
      this.expectStack(fvm, [9]);
    });

    // Numeric word names are allowed in Forth
    this.test('Numeric word names are allowed', () => {
      const fvm = new Fvm();
      fvm.execute(': 123 dup * ;');
      fvm.execute('5 123');
      this.expectStack(fvm, [25]);
    });

    // Stack preservation
    this.test('Definition does not affect current stack', () => {
      const fvm = new Fvm();
      fvm.execute('10 20');
      fvm.execute(': test 5 5 + ;');
      this.expectStack(fvm, [10, 20]);
    });

    this.test('Execute definition multiple times', () => {
      const fvm = new Fvm();
      fvm.execute(': triple 3 * ;');
      fvm.execute('2 triple');
      fvm.execute('triple');
      this.expectStack(fvm, [18]);
    });

    this.test('IF executes true branch and continues after THEN', () => {
      const fvm = new Fvm();
      fvm.execute(': cond IF 10 THEN 99 ;');
      fvm.execute('-1 cond');
      this.expectStack(fvm, [10, 99]);
      fvm.resetFVM();
      fvm.execute(': cond IF 10 THEN 99 ;');
      fvm.execute('0 cond');
      this.expectStack(fvm, [99]);
    });

    this.test('IF ELSE THEN executes correct branch', () => {
      const fvm = new Fvm();
      fvm.execute(': choose IF 10 ELSE 20 THEN 30 ;');
      fvm.execute('-1 choose');
      this.expectStack(fvm, [10, 30]);
      fvm.resetFVM();
      fvm.execute(': choose IF 10 ELSE 20 THEN 30 ;');
      fvm.execute('0 choose');
      this.expectStack(fvm, [20, 30]);
    });

    this.test('Multiple ELSE segments alternate branches', () => {
      const fvm = new Fvm();
      fvm.execute(': ladder IF 1 ELSE 2 ELSE 3 ELSE 4 THEN ;');
      fvm.execute('-1 ladder');
      this.expectStack(fvm, [1, 3]);
      fvm.resetFVM();
      fvm.execute(': ladder IF 1 ELSE 2 ELSE 3 ELSE 4 THEN ;');
      fvm.execute('0 ladder');
      this.expectStack(fvm, [2, 4]);
    });

    this.test('DO LOOP skips when start equals limit', () => {
      const fvm = new Fvm();
      fvm.execute(': noop-loop 5 5 DO 999 LOOP ;');
      fvm.execute('noop-loop');
      this.expectStack(fvm, []);
    });

    this.test('+LOOP with unit step iterates correctly', () => {
      const fvm = new Fvm();
      fvm.execute(': steps 5 0 DO I 1 +LOOP ;');
      fvm.execute('steps');
      this.expectStack(fvm, [0, 1, 2, 3, 4]);
    });

    this.test('+LOOP with negative step iterates downward', () => {
      const fvm = new Fvm();
      fvm.execute(': back 0 5 DO I -2 +LOOP ;');
      fvm.execute('back');
      this.expectStack(fvm, [5, 3, 1]);
    });

    this.test('I pushes current loop index', () => {
      const fvm = new Fvm();
      fvm.execute(': use-i 3 0 DO I LOOP ;');
      fvm.execute('use-i');
      this.expectStack(fvm, [0, 1, 2]);
    });

    this.test('J pushes outer loop index', () => {
      const fvm = new Fvm();
      fvm.execute(': use-j 2 0 DO 3 0 DO J LOOP LOOP ;');
      fvm.execute('use-j');
      this.expectStack(fvm, [0, 0, 0, 1, 1, 1]);
    });

    this.test('LEAVE exits loop immediately', () => {
      const fvm = new Fvm();
      fvm.execute(': leave-test 5 0 DO 42 LEAVE 99 LOOP ;');
      fvm.execute('leave-test');
      this.expectStack(fvm, [42]);
    });

    this.test('EXIT leaves definition early', () => {
      const fvm = new Fvm();
      fvm.execute(': exit-test 1 EXIT 2 ;');
      fvm.execute('exit-test');
      this.expectStack(fvm, [1]);
    });

    this.test('UNLOOP removes loop frame before EXIT', () => {
      const fvm = new Fvm();
      fvm.execute(': unloop-test 5 0 DO 123 UNLOOP EXIT LOOP ;');
      fvm.execute('unloop-test');
      this.expectStack(fvm, [123]);
    });

    this.test('BEGIN UNTIL repeats until condition true', () => {
      const fvm = new Fvm();
      fvm.execute(': begin-until 3 BEGIN DUP 1- DUP 0= UNTIL DROP ;');
      fvm.execute('begin-until');
      this.expectStack(fvm, [3, 2, 1]);
    });

    this.test('BEGIN WHILE REPEAT handles conditional loop', () => {
      const fvm = new Fvm();
      fvm.execute(': begin-while-repeat 5 BEGIN DUP WHILE DUP 1- REPEAT DROP ;');
      fvm.execute('begin-while-repeat');
      this.expectStack(fvm, [5, 4, 3, 2, 1]);
    });

    this.test('Redefine existing user word', () => {
      const fvm = new Fvm();
      fvm.execute(': foo 5 ;');
      fvm.execute('foo');
      this.expectStack(fvm, [5]);
      fvm.execute(': foo 10 ;');
      fvm.execute('foo');
      this.expectStack(fvm, [5, 10]);
    });

    // Summary
    this.put('');
    this.put(`***** Passed: ${this.passed}, Failed: ${this.failed} *****`);
    return this.failed === 0;
  }
}

const suite = new CompileTestSuite();
const allPassed = suite.run();
  
try {
    process.exit(allPassed ? 0 : 1);
} catch (e) {
    // In browser environments, process may not be defined
}