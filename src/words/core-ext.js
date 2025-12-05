export const coreExt = {
    // https://forth-standard.org/standard/core/NIP
    'NIP': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        this.dataStack.pop(); // w1
        this.dataStack.push(w2);
    },
    // https://forth-standard.org/standard/core/TUCK
    'TUCK': function() { // tested
        this.checkStackUnderflow(2);
        const w2 = this.dataStack.pop();
        const w1 = this.dataStack.pop();
        this.dataStack.push(w2, w1, w2);
    },
    // https://forth-standard.org/standard/core/PICK
    'PICK': function() { // tested
        this.checkStackUnderflow(1);
        const topNumber = this.dataStack.pop();
        this.checkStackUnderflow(topNumber.toNumber());
        const pickedNumber = this.dataStack[(this.dataStack.length - 1) - topNumber.toNumber()];
        this.dataStack.push(pickedNumber);
    },
    // https://forth-standard.org/standard/core/ROLL
    'ROLL': function() { // tested
        this.checkStackUnderflow(1);
        const rollAmount = this.dataStack.pop();
        this.checkStackUnderflow(rollAmount.toNumber());
        const targetIndex = this.dataStack.length - 1 - rollAmount.toNumber();
        const target = this.dataStack.splice(targetIndex, 1);
        this.dataStack.push(target[0]);
    },

}