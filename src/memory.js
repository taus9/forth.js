import { Cell } from './types/cell.js';

export class ForthMemory {
    
    constructor() {
        this._map = new Map();
        this._stringTable = new Map();
        this._nextAddress = 1n; // start at 1, reserving 0 as invalid
    }

    allocateString(string) {
        const address = this._generateAddress();
        this._stringTable.set(address, string);
        return address;
    }

    fetchString(address) {
        const u = BigInt.asUintN(64, BigInt(address));
        if (!this._stringTable.has(u)) {
            throw new Error(`Invalid string memory access at address ${u.toString()}`);
        }
        return this._stringTable.get(u);
    }

    storeString(address, string) {
        const u = BigInt.asUintN(64, BigInt(address));
        if (!this._stringTable.has(u)) {
            throw new Error(`Invalid string memory access at address ${u.toString()}`);
        }
        this._stringTable.set(u, string);
    }

    freeString(address) {
        const u = BigInt.asUintN(64, BigInt(address));
        if (!this._stringTable.has(u)) {
            throw new Error(`Invalid string memory access at address ${u.toString()}`);
        }
        this._stringTable.delete(u);
    }

    allocate() {
        const address = this._generateAddress();
        this._map.set(address, new Cell(0));
        return address;
    }

    fetch(address) {
        const u = BigInt.asUintN(64, BigInt(address));
        if (!this._map.has(u)) {
            throw new Error(`Invalid memory access at address ${u.toString()}`);
        }
        return this._map.get(u);
    }

    store(address, cell) {
        const u = BigInt.asUintN(64, BigInt(address));
        if (!this._map.has(u)) {
            throw new Error(`Invalid memory access at address ${u.toString()}`);
        }
        this._map.set(u, cell);
    }

    free(address) {
        const u = BigInt.asUintN(64, BigInt(address));
        if (!this._map.has(u)) {
            throw new Error(`Invalid memory access at address ${u.toString()}`);
        }
        this._map.delete(u);
    }

    has(address) {
        const u = BigInt.asUintN(64, BigInt(address));
        return this._map.has(u);
    }

    _generateAddress() {
        const address = this._nextAddress;
        this._nextAddress = (this._nextAddress + 1n) & ((1n << 64n) - 1n);
        if (this._nextAddress === 0n) {
            this._nextAddress = 1n;
        }
        return address;
    } 
}