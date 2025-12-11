#!/usr/bin/env node
import { Fvm } from '../src/forth.js';
import * as errors from '../src/errors/errors.js';

export class StringTestSuite {
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

  expectOutput(fvm, expected) {
    const actual = fvm.getOutput();
    if (actual !== expected) {
      throw new Error(`Expected output "${expected}" got "${actual}"`);
    }
  }

  expectStack(fvm, expected) {
    const actualValues = fvm.dataStack.map(cell => cell.toNumber());
    const ok = actualValues.length === expected.length && 
               actualValues.every((v, i) => v === expected[i]);
    if (!ok) throw new Error(`Expected stack [${expected}] got [${actualValues}]`);
  }

  run() {
    this.put('');
    this.put('========== String Test Suite ==========');
    this.put('');
    this.put('--- .\" (Dot-Quote) Tests ---');
    this.put('');

    // Basic interpret mode tests
    this.test('." prints simple string in interpret mode', () => {
      const fvm = new Fvm();
      fvm.execute('." Hello"');
      this.expectOutput(fvm, 'Hello');
    });

    this.test('." prints string with spaces', () => {
      const fvm = new Fvm();
      fvm.execute('." Hello, World!"');
      this.expectOutput(fvm, 'Hello, World!');
    });

    this.test('." prints empty string', () => {
      const fvm = new Fvm();
      fvm.execute('." "');
      // Empty string gets trimmed by getOutput()
      this.expectOutput(fvm, '');
    });

    this.test('Multiple ." calls concatenate output', () => {
      const fvm = new Fvm();
      fvm.execute('." Hello" ." , " ." World"');
      this.expectOutput(fvm, 'Hello, World');
    });

    this.test('." does not affect data stack', () => {
      const fvm = new Fvm();
      fvm.execute('42 ." test" 17');
      this.expectStack(fvm, [42, 17]);
      this.expectOutput(fvm, 'test');
    });

    // Compile mode tests
    this.test('." works in colon definition', () => {
      const fvm = new Fvm();
      fvm.execute(': greet ." Hello!" ;');
      fvm.execute('greet');
      this.expectOutput(fvm, 'Hello!');
    });

    this.test('Multiple ." in definition', () => {
      const fvm = new Fvm();
      fvm.execute(': greeting ." Hello, " ." World!" ;');
      fvm.execute('greeting');
      this.expectOutput(fvm, 'Hello, World!');
    });

    this.test('." mixed with other words in definition', () => {
      const fvm = new Fvm();
      fvm.execute(': show-result ." Result: " . ;');
      fvm.execute('42 show-result');
      this.expectOutput(fvm, 'Result: 42');
    });

    this.test('." before and after computation', () => {
      const fvm = new Fvm();
      fvm.execute(': calc ." Computing: " 2 3 + . ." done" ;');
      fvm.execute('calc');
      this.expectOutput(fvm, 'Computing: 5 done');
    });

    this.test('Definition can be called multiple times', () => {
      const fvm = new Fvm();
      fvm.execute(': hi ." Hi!" ;');
      fvm.execute('hi');
      const first = fvm.getOutput();
      fvm.execute('hi');
      const second = fvm.getOutput();
      if (first !== 'Hi!' || second !== 'Hi!') {
        throw new Error(`Expected "Hi!" both times, got "${first}" and "${second}"`);
      }
    });

    this.put('');
    this.put(`Tests: ${this.passed} passed, ${this.failed} failed`);
    this.put('');
    
    if (this.failed > 0) {
      throw new Error(`${this.failed} test(s) failed`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const suite = new StringTestSuite();
  suite.run();
}
