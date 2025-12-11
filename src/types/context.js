
// Used on the return stack to manage control flow and runtime contexts
export class DoRuntimeContext {
    constructor(limit, index, frameStartIndex, frameExitIndex) {
        this.limit = limit;
        this.index = index;
        this.frameStartIndex = frameStartIndex;
        this.frameExitIndex = frameExitIndex;
    }
}

export class BeginRuntimeContext {
    constructor(frameStartIndex, frameExitIndex) {
        this.frameStartIndex = frameStartIndex;
        this.frameExitIndex = frameExitIndex;
    }
}


// Used during compilation to manage control flow structures
export class DoControlContext {
    constructor(loopTypePlaceholderIndex, exitPlaceholderIndex) {
        this.loopTypePlaceholderIndex = loopTypePlaceholderIndex;
        this.exitPlaceholderIndex = exitPlaceholderIndex;
    }
}

export class BeginControlContext {
    constructor(exitPlaceholderIndex) {
        this.exitPlaceholderIndex = exitPlaceholderIndex;
    }
}

export class WhileControlContext {
    constructor(exitPlaceholderIndex) {
        this.exitPlaceholderIndex = exitPlaceholderIndex;
    }
}