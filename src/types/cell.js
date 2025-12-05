"use strict";

export class Cell {
    constructor(value) {
        this.value = BigInt.asUintN(64, BigInt(value));
    }

    toSigned() {
        return BigInt.asIntN(64, this.value);
    }

    toUnsigned() {
        return this.value;
    }
}