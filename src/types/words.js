export class Word {
    constructor(name, callback = null, flag = null) {
        this.name = name;
        this.callback = callback;
        this.flag = flag;
    }
}

export class NumberWord {
    constructor(name, cell) {
        this.name = name;
        this.cell = cell;
    }
}

export class CompileWord {
    constructor(name) {
        this.name = name;
    }
}

export class TextWord {
    constructor(name) {
        this.name = name;
    }
}