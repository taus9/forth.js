
export const misc = {    
    // Tools Ext
    '.S': { 
        'flags': [],
        'entry': function() { // tested
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
        'flags': [],
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
        'flags': [],
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
        'flags': [],
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
        'flags': [],
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