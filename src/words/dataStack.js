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
    
    '.S': function() {
        const stackString = this.stackToString();
        const stackCount = this.dataStack.length;
        this.output = `<${stackCount}> ${stackString}`;
    },

    'nip': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        this.dataStack.pop(); // w1
        this.dataStack.push(w2);
    },


    'tuck': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w1, w2);
    },


    'pick': function() { // tested
        this.checkStackUnderflow(1);
        const topNumber = this.dataStack.pop();
        this.checkStackUnderflow(topNumber);
        const pickedNumber = this.dataStack[(this.dataStack.length - 1) - topNumber];
        this.dataStack.push(pickedNumber);
    },



    '-rot': function() { // tested
        this.checkStackUnderflow(3);
        const w3 = this.dataStack.pop();
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w3, w1, w2);
    },


    'roll': function() { // tested
        this.checkStackUnderflow(1);
        const rollAmount = this.dataStack.pop();
        this.checkStackUnderflow(rollAmount);
        const targetIndex = this.dataStack.length - 1 - rollAmount;
        const target = this.dataStack.splice(targetIndex, 1);
        this.dataStack.push(target[0]);
    },



    '2nip': function() { // tested
        this.checkStackUnderflow(4);
        const w4 = this.dataStack.pop();
        const w3 = this.dataStack.pop();
        this.dataStack.pop(); // w2
        this.dataStack.pop(); // w1
        this.dataStack.push(w3, w4);
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
