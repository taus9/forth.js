export class Word {
    constructor(rawText, callback) {
        this.rawText = rawText;
        this.callback = callback
    }
}

export class MathWord extends Word {
    constructor(rawText, type) {
        super(rawText);
        this.type = type;
    }
}

export class NumberWord extends Word {
    constructor(rawText, value) {
        super(rawText);
        this.value = value;
    }
}

export class InvalidWord extends Word {
    constructor(rawText) {
        super(rawText);
    }
}