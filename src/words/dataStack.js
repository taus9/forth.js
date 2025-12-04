/* 
  All functions must check for stack underflow before attempting the operation.
  Forth words do not partially execute and then fail. They check the stack 
  first, and if there aren’t enough items, they throw an error immediately.

  Example:
    the 'dup' word needs at least one item on the stack to properly perform it's
    function, so you would call 'this.checkStackUnderflow(1)'. If the check
    fails then an error is thrown in the Fvm class and execution is stopped.
    
    '2rot' requires at least 6 items on the stack so you would call
    'this.checkStackUnderflow(6)'.
    
    ect.
*/

export const dataStack = {
    '.': function() {
        this.checkStackUnderflow(1);
        const w1 = this.dataStack.pop();
        this.output = `${w1}`;
    },
    
    '.S': function() {
        const stackString = this.stackToString();
        const stackCount = this.dataStack.length;
        this.output = `<${stackCount}> ${stackString}`;
    },
    
    
    'drop': function(){ // tested
        this.checkStackUnderflow(1);
        this.dataStack.pop();
    },

    'dup': function() { // tested
        this.checkStackUnderflow(1);
        const w = this.dataStack[this.dataStack.length - 1];
        this.dataStack.push(w);      
    },

    'nip': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        this.dataStack.pop(); // w1
        this.dataStack.push(w2);
    },

    'over': function() { // tested
        this.checkStackUnderflow(2);
        const w1 = this.dataStack[this.dataStack.length - 2];
        this.dataStack.push(w1);
    },

    'tuck': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w1, w2);
    },

    'swap': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w1);
    },

    'pick': function() { // tested
        this.checkStackUnderflow(1);
        const topNumber = this.dataStack.pop();
        this.checkStackUnderflow(topNumber);
        const pickedNumber = this.dataStack[(this.dataStack.length - 1) - topNumber];
        this.dataStack.push(pickedNumber);
    },

    'rot': function() { // tested
        this.checkStackUnderflow(3);
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w3, w1);
    },

    '-rot': function() { // tested
        this.checkStackUnderflow(3);
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w3, w1, w2);
    },

    '?dup': function() { // tested
        this.checkStackUnderflow(1);
        const topNumber = this.dataStack[this.dataStack.length - 1];
        if (topNumber !== 0) {
            this.dataStack.push(topNumber);   
        }
    },

    'roll': function() { // tested
        this.checkStackUnderflow(1);
        const rollAmount = this.dataStack.pop();
        this.checkStackUnderflow(rollAmount);
        const targetIndex = this.dataStack.length - 1 - rollAmount;
        const target = this.dataStack.splice(targetIndex, 1);
        this.dataStack.push(target[0]);
    },

    '2drop': function() { // tested
        this.checkStackUnderflow(2);
        this.dataStack.pop(); // w2
        this.dataStack.pop(); // w1
    },

    '2nip': function() { // tested
        this.checkStackUnderflow(4);
        const w4 = this.dataStack.pop();
        const w3 = this.dataStack.pop();
        this.dataStack.pop(); // w2
        this.dataStack.pop(); // w1
        this.dataStack.push(w3, w4);
    },

    '2dup': function() { //tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w1, w2, w1, w2);
    },

    '2over': function() { // tested
        this.checkStackUnderflow(4);
        const len = this.dataStack.length
        const w1 = this.dataStack[len - 4];
        const w2 = this.dataStack[len - 3];
        this.dataStack.push(w1, w2);
    },

    '2tuck': function() { // tested
        this.checkStackUnderflow(4);
        const w4 = this.dataStack.pop();
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push (
            w3, w4, w1, w2, w3, w4
        );
    },

    '2swap': function() { // tested
        this.checkStackUnderflow(4);
        const w4 = this.dataStack.pop();
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push (
            w3, w4, w1, w2
        );
    },

    '2rot': function() { // tested
        this.checkStackUnderflow(6);
        const w6 = this.dataStack.pop();
        const w5 = this.dataStack.pop();
        const w4 = this.dataStack.pop();
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push (
            w3, w4, w5, w6, w1, w2
        );
    }
}
