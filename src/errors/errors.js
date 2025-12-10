export const ErrorTypes = {
    PARSE: 'ParseError',
    STACK: 'StackError',
    OPERATION: 'OperationError',
    INTERPRETER: 'InterpreterError'
};

export const ErrorMessages = {
    UNDEFINED_WORD: 'Undefined word',
    STACK_UNDERFLOW: 'Stack underflow',
    DIV_BY_ZERO: 'Divide by zero',
    NESTED_DEFINITION: 'Nested definition',
    INVALID_WORD_NAME: 'Invalid word name',
    ZERO_LENGTH_NAME: 'Attempt to use zero-length string as a name',
    COMPILE_ONLY_WORD: 'Interpreting a compile-only word',
    INVALID_CODE: 'Attempted to execute invalid code type',
    INVALID_MEMORY_ACCESS: 'Invalid memory access',
    CONTROL_EXPECTED: 'Expected control flow stack item',
    UNMATCHED_CONTROL_STRUCTURE: 'Unmatched control structure',
    RETURN_STACK_UNDERFLOW: 'Return stack underflow'
};

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

export class InterpreterError extends Error {
    constructor(message) {
        super(message);
        this.name = ErrorTypes.INTERPRETER;
    }
}   