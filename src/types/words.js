export class Word {
    constructor(name, callback = null, flags = []) {
        this.name = name;
        this.callback = callback;
        this.flags = flags;
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

export class StringWord {
    constructor(content) {
        this.name = '."';
        this.content = content;
    }
}