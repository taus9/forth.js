export const StatusTypes = {
    OK: 'ok',
    COMPILED: 'compiled',
    ERROR: '?'
};

export const ForthState = {
    INTERPRET: 0,
    COMPILE: 2
}

export const FlagTypes = {
    NONE: null,
    IMMEDIATE: 'immediate',
    COMPILE_ONLY: 'compile-only',
    DEFINING_WORD: 'defining-word'
}