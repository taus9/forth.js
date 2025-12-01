#!/usr/bin/env node
/**
 * Node-compatible test runner for forth.js
 * Imports FvmTestSuite and runs tests with stdout output.
 */

import { Fvm } from '../forth/forth.js';
import { FvmTestSuite } from '../tests/forth.test.js';

const fvm = new Fvm();
const output = [];

const put = (text) => {
  output.push(text);
  console.log(text);
};

// Run the test suite
console.log('\n========== forth.js Test Suite ==========\n');
const suite = new FvmTestSuite(fvm, put);
suite.runTestSuite();

console.log('\n========== Tests Complete ==========\n');
console.log(`Total lines of output: ${output.length}`);
