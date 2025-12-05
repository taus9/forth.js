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
      this.expectError(() => fvm.execute('5 3 ;'), errors.ErrorTypes.PARSE);
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