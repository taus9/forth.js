#!/usr/bin/env node
/**
 * Error case and edge case tests for forth.js
 * Tests: underflow, undefined words, division by zero, unterminated comments, extreme values, etc.
 */

import { Fvm } from '../src/forth.js';
import * as errors from '../src/errors/errors.js';
import { Cell } from '../src/types/cell.js';

export class ErrorTestSuite {
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

  expectError(fn, expectedErrorType, expectedMessage = null) {

    try {
      fn();
      throw new Error(`Expected ${expectedErrorType} but no error was thrown`);
    } catch (err) {
      if (err.name !== expectedErrorType) {
        throw new Error(
          `Expected error type ${expectedErrorType}, got ${err.name}: ${err.message}`
        );
      }
      if (expectedMessage && !err.message.includes(expectedMessage)) {
        throw new Error(
          `Expected message containing "${expectedMessage}", got "${err.message}"`
        );
      }
    }
  }

  run() {
    this.put('');
    this.put('========== Errors Test Suite ==========');
    this.put('');

    // --- Underflow tests ---
    this.put('--- Stack Underflow ---');

    this.test('drop on empty stack throws StackError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('drop'),
        errors.ErrorTypes.STACK,
        'Stack underflow'
      );
    });

    this.test('+ with only one item throws StackError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('5 +'),
        errors.ErrorTypes.STACK,
        'Stack underflow'
      );
    });

    this.test('* on empty stack throws StackError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('*'),
        errors.ErrorTypes.STACK,
        'Stack underflow'
      );
    });

    this.test('swap with one item throws StackError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('3 swap'),
        errors.ErrorTypes.STACK,
        'Stack underflow'
      );
    });

    this.test('dup on empty stack throws StackError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('dup'),
        errors.ErrorTypes.STACK,
        'Stack underflow'
      );
    });

    this.test('Stack is cleared after underflow error', () => {
      const fvm = new Fvm();
      try {
        fvm.execute('1 2 3 drop drop drop drop');  // underflow on last drop
      } catch (err) {
        // Expected error on underflow
      }
      // After error, stack should be cleared
      if (fvm.dataStack.length !== 0) {
        throw new Error(`Stack not cleared after underflow error; length: ${fvm.dataStack.length}`);
      }
    });

    // --- Undefined word tests ---
    this.put('');
    this.put('--- Undefined Words ---');

    this.test('Unknown word throws ParseError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('unknownword'),
        errors.ErrorTypes.PARSE,
        'Undefined word'
      );
    });

    this.test('Typo in word name throws ParseError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('drup'),  // typo for 'drop'
        errors.ErrorTypes.PARSE,
        'Undefined word'
      );
    });

    this.test('Stack is cleared after undefined word error', () => {
      const fvm = new Fvm();
      fvm.dataStack = [new Cell(100), new Cell(200)];
      try {
        fvm.execute('unknownword');
      } catch (err) {
        // Expected
      }
      if (fvm.dataStack.length !== 0) {
        throw new Error(`Stack not cleared after undefined word error`);
      }
    });

    // --- Division tests ---
    this.put('');
    this.put('--- Division Edge Cases ---');

    this.test('Division by zero throws OperationError', () => {
      const fvm = new Fvm();
      this.expectError(
        () => fvm.execute('5 0 /'),
        errors.ErrorTypes.OPERATION,
        'Divide by zero'
      );
    });

    this.test('Stack is cleared after division by zero', () => {
      const fvm = new Fvm();
      fvm.dataStack = [new Cell(10), new Cell(0)];
      try {
        fvm.execute('/');
      } catch (err) {
        // Expected
      }
      if (fvm.dataStack.length !== 0) {
        throw new Error(`Stack not cleared after division by zero`);
      }
    });

    this.test('Division with floored semantics: 7 2 / = 3', () => {
      const fvm = new Fvm();
      fvm.execute('7 2 /');
      if (fvm.dataStack[0].toNumber() !== 3) {
        throw new Error(`Expected 3, got ${fvm.dataStack[0].toNumber()}`);
      }
    });

    this.test('Negative division with floored semantics: -7 2 / = -4', () => {
      const fvm = new Fvm();
      fvm.execute('-7 2 /');
      if (fvm.dataStack[0].toNumber() !== -4) {
        throw new Error(`Expected -4, got ${fvm.dataStack[0].toNumber()}`);
      }
    });

    // --- Comment tests ---
    this.put('');
    this.put('--- Comments ---');

    this.test('Comment with space: ( this is a comment ) works', () => {
      const fvm = new Fvm();
      fvm.execute('5 ( this is a comment ) 3 +');
      if (fvm.dataStack[0].toNumber() !== 8) {
        throw new Error(`Expected 8, got ${fvm.dataStack[0].toNumber()}`);
      }
    });

    this.test('Comment without closing paren (unterminated) consumed to EOF', () => {
      const fvm = new Fvm();
      fvm.execute('5 ( unterminated comment');
      if (fvm.dataStack[0].toNumber() !== 5) {
        throw new Error(`Expected 5 on stack, got ${fvm.dataStack[0].toNumber()}`);
      }
    });


    // --- Extreme values ---
    this.put('');
    this.put('--- Extreme Values ---');

    // the ** word has been removed because it is not
    // apart of the ANS Forth dicitionary 
    // this.test('Large exponent: 2 100 ** produces 0 (clamped from overflow)', () => {
    //   const fvm = new Fvm();
    //   fvm.execute('2 100 **');
    //   const result = fvm.dataStack[0];
    //   if (result !== 0) {
    //     throw new Error(`Expected 0 (overflow clamped), got ${result}`);
    //   }
    // });

    // this.test('Zero to zero power: 0 0 ** = 1 (JavaScript behavior)', () => {
    //   const fvm = new Fvm();
    //   fvm.execute('0 0 **');
    //   if (fvm.dataStack[0] !== 1) {
    //     throw new Error(`Expected 1, got ${fvm.dataStack[0]}`);
    //   }
    // });

    // this.test('Negative base with exponent: -2 3 ** = -8', () => {
    //   const fvm = new Fvm();
    //   fvm.execute('-2 3 **');
    //   if (fvm.dataStack[0] !== -8) {
    //     throw new Error(`Expected -8, got ${fvm.dataStack[0]}`);
    //   }
    // });

    this.test('Modulus: 10 3 MOD = 1', () => {
      const fvm = new Fvm();
      fvm.execute('10 3 MOD');
      if (fvm.dataStack[0].toNumber() !== 1) {
        throw new Error(`Expected 1, got ${fvm.dataStack[0].toNumber()}`);
      }
    });

    this.test('Negative modulus: -10 3 MOD = 2', () => {
      const fvm = new Fvm();
      fvm.execute('-10 3 MOD');
      const result = fvm.dataStack[0].toNumber();
      if (result !== 2) {
        throw new Error(`Expected 2, got ${result}`);
      }
    });

    // --- Multiple errors ---
    this.put('');
    this.put('--- Multiple Operations & Recovery ---');

    this.test('After error, new execution works (state reset)', () => {
      const fvm = new Fvm();
      try {
        fvm.execute('unknownword');
      } catch (e) {
        // Expected
      }
      // After error, stack is cleared and state is reset
      fvm.execute('5 3 +');
      if (fvm.dataStack[0].toNumber() !== 8) {
        throw new Error(`Expected 8 after error recovery, got ${fvm.dataStack[0].toNumber()}`);
      }
    });

    this.test('Reset clears stack and state', () => {
      const fvm = new Fvm();
      fvm.execute('1 2 3');
      fvm.reset();
      if (fvm.dataStack.length !== 0) {
        throw new Error(`Stack not cleared by reset`);
      }
      if (fvm.status !== 'ok') {
        throw new Error(`Status not reset to 'ok', got: ${fvm.status}`);
      }
    });

    // Summary
    this.put('');
    this.put(`***** Passed: ${this.passed}, Failed: ${this.failed} *****`);
    return this.failed === 0;
  }
}

// Run the test suite
const suite = new ErrorTestSuite();
const allPassed = suite.run();

try {
    process.exit(allPassed ? 0 : 1);
} catch (e) {
    // In browser environments, process may not be defined
}