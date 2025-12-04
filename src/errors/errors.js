export const ErrorTypes = {
    PARSE: 'ParseError',
    STACK: 'StackError',
    OPERATION: 'OperationError'
};

export const ErrorMessages = {
    UNDEFINED_WORD: 'Undefined word',
    STACK_UNDERFLOW: 'Stack underflow',
    DIV_BY_ZERO: 'Divide by zero',
    NESTED_DEFINITION: 'Nested definition',
    NAME_EXPECTED: 'Word name expected',
    INVALID_WORD_NAME: 'Invalid word name'
}

export class ParseError extends Error {
    constructor(message, rawText = '') {
        super(message);
        this.name = ErrorTypes.PARSE;
        this.rawText = rawText;
    }
}

export class StackError extends Error {
    constructor(message) {
        super(message);
        this.name = ErrorTypes.STACK;
    }
}

export class OperationError extends Error {
    constructor(message) {
        super(message);
        this.name = ErrorTypes.OPERATION;
    }
}