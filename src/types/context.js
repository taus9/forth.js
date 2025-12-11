export class DoLoopContext {
    constructor(limit, index, frameStartIndex, frameExitIndex) {
        this.limit = limit;
        this.index = index;
        this.frameStartIndex = frameStartIndex;
        this.frameExitIndex = frameExitIndex;
    }
}

export class BeginLoopContext {
    constructor(frameStartIndex, frameExitIndex) {
        this.frameStartIndex = frameStartIndex;
        this.frameExitIndex = frameExitIndex;
    }
}