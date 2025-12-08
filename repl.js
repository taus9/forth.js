#!/usr/bin/env node
"use strict";

import readline from 'readline';
import { Fvm } from './src/forth.js';
import * as types from './src/types/types.js';

const fvm = new Fvm();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function printStack() {
  if (fvm.dataStack.length === 0) {
    console.log(`${colors.dim}<empty>${colors.reset}`);
  } else {
    const stackValues = fvm.dataStack.map(cell => cell.toNumber()).join(' ');
    console.log(`${colors.cyan}[${stackValues}]${colors.reset}`);
  }
}

function printBanner() {
  console.log(`${colors.bright}forth.js REPL${colors.reset}`);
  console.log(`${colors.dim}Type @help for commands, @exit to quit${colors.reset}\n`);
}

function printHelp() {
  console.log(`${colors.bright}REPL Commands:${colors.reset}`);
  console.log(`  ${colors.green}@help${colors.reset}    - Show this help message`);
  console.log(`  ${colors.green}@exit${colors.reset}    - Exit the REPL`);
  console.log(`  ${colors.green}@stack${colors.reset}   - Show current stack`);
  console.log(`  ${colors.green}@reset${colors.reset}   - Reset the VM state`);
  console.log(`  ${colors.green}@words${colors.reset}   - List all defined words`);
  console.log(`\n${colors.bright}Forth Commands:${colors.reset}`);
  console.log(`  Try: ${colors.yellow}5 3 +${colors.reset} or ${colors.yellow}: square dup * ;${colors.reset}`);
}

function listWords() {
  const wordList = Object.keys(fvm.words).sort();
  console.log(`${colors.bright}Defined words (${wordList.length}):${colors.reset}`);
  
  // Print in columns
  const columns = 6;
  for (let i = 0; i < wordList.length; i += columns) {
    const row = wordList.slice(i, i + columns);
    console.log(`  ${row.map(w => w.padEnd(12)).join('')}`);
  }
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${colors.green}fvm>${colors.reset} `,
});

printBanner();
rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();

  // Helper: remove the echoed "fvm> ... " line that readline printed.
  // Works by moving the cursor up one line and clearing it.
  const eraseEchoedInputLine = () => {
    // Move cursor up 1 line
    process.stdout.write('\x1b[1A');
    // Clear entire line
    process.stdout.write('\x1b[2K');
  }

  // If there's any non-empty input, readline has already echoed it.
  // Erase that echo so we can print our own status lines below.
  // For empty input we still want to remove the (empty) echoed prompt line,
  // because you said you don't want the final echo after Enter.
  eraseEchoedInputLine();

  // Handle REPL commands
  if (input.startsWith('@')) {
    switch (input) {
      case '@help':
        printHelp();
        break;
      case '@exit':
      case '@quit':
        console.log('Goodbye!');
        process.exit(0);
        break;
      case '@stack':
        printStack();
        break;
      case '@reset':
        fvm.resetFVM();
        console.log(`${colors.yellow}VM reset${colors.reset}`);
        break;
      case '@words':
        listWords();
        break;
      default:
        console.log(`${colors.red}Unknown command: ${input}${colors.reset}`);
        console.log(`Type ${colors.green}@help${colors.reset} for available commands`);
    }
    rl.prompt();
    return;
  }

  // Skip empty lines
  if (input.length === 0) {
    rl.prompt();
    return;
  }

  // Execute Forth code
  try {
    fvm.execute(input);
    
    // Move cursor up and append status to the command line
    readline.moveCursor(process.stdout, 0, -1);
    readline.cursorTo(process.stdout, input.length + 5); // 5 = "fvm> ".length
    
    const color = fvm.state === types.ForthState.INTERPRET ? colors.dim : colors.yellow;
    console.log(` ${fvm.output}${color} ${fvm.status}${colors.reset}`);
    
    // Show stack state
    if (fvm.state === types.ForthState.INTERPRET) {
      printStack();
    }
  } catch (error) {
    // Move cursor up and append error status
    readline.moveCursor(process.stdout, 0, -1);
    readline.cursorTo(process.stdout, input.length + 5);
    console.log(`${colors.red} ?${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n(To exit, type @exit or press Ctrl+D)');
  rl.prompt();
});
