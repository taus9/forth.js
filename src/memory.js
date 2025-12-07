import { Cell } from './types/cell.js';

export class ForthMemory {
    
    constructor() {
        this._map = new Map();
    }

    allocate() {
        let u;
        while (true) {
            const address = this._generateAddress();
            u = BigInt.asUintN(64, BigInt(address));
            if (this._map.has(u)) {
                continue;
            }
            break;
        }
        this._map.set(u, new Cell(0));
        return u;
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
        return Math.floor(Math.random() * Number.MAX_VALUE) + 1;
    } 
}