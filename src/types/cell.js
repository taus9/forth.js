/*
All values in ANS Forth are stored as unsigned 
integers. Wether they are 32 bit or 64 bit depends 
on the implementation. Forth.js uses 64 bit cells.
*/

"use strict";

export class Cell {
    constructor(value) {
        // JavaScript uses 53-bit precision for numbers,
        // so we use BigInt to represent full 64-bit unsigned integers.
        this.value = BigInt.asUintN(64, BigInt(value));
    }

    toSigned() {
        return BigInt.asIntN(64, this.value);
    }

    toUnsigned() {
        return this.value;
    }

    toNumber() {
        // Convert signed value to regular JavaScript number
        return Number(this.toSigned());
    }
}