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

export const misc = {    
    // Tools Ext
    '.S': {   
        'flag': types.FlagTypes.NONE,
        'entry': function() {
            const stackString = 
            this.dataStack
            .map(cell => cell.toSigned())
            .join(' ');
            const stackCount = this.dataStack.length;
            this.output = `<${stackCount}> ${stackString}`;
        } 
    },
    // https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack
    '-ROT':{
        'flag': types.FlagTypes.NONE,
        'entry': function() { // tested
            this.checkStackUnderflow(3);
            const w3 = this.dataStack.pop();
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push(w3, w1, w2);
        } 
    },

    // https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack
    '2NIP': {
        'flag': types.FlagTypes.NONE,
        'entry': function() { // tested
            this.checkStackUnderflow(4);
            const w4 = this.dataStack.pop();
            const w3 = this.dataStack.pop();
            this.dataStack.pop(); // w2
            this.dataStack.pop(); // w1
            this.dataStack.push(w3, w4);
        }
    },
    // https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack
    '2TUCK': {
        'flag': types.FlagTypes.NONE,
        'entry': function() { // tested
            this.checkStackUnderflow(4);
            const w4 = this.dataStack.pop();
            const w3 = this.dataStack.pop();
            const w2 = this.dataStack.pop();
            const w1 = this.dataStack.pop();
            this.dataStack.push (
                w3, w4, w1, w2, w3, w4
            );
        }
    },
    // https://www.complang.tuwien.ac.at/forth/gforth/Docs-html/Data-stack.html#Data-stack
    '2ROT': {
        'flag': types.FlagTypes.NONE,
        'entry': function() { // tested
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
}