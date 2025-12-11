export class DoControl {
    constructor(loopTypePlaceholderIndex, exitPlaceholderIndex) {
        this.loopTypePlaceholderIndex = loopTypePlaceholderIndex;
        this.exitPlaceholderIndex = exitPlaceholderIndex;
    }
}

export class BeginControl {
    constructor(exitPlaceholderIndex) {
        this.exitPlaceholderIndex = exitPlaceholderIndex;
    }
}

export class WhileControl {
    constructor(exitPlaceholderIndex) {
        this.exitPlaceholderIndex = exitPlaceholderIndex;
    }
}