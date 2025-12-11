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
    NONE: 0,
    IMMEDIATE: 1,
    COMPILE_ONLY: 2,
    DEFINING_WORD: 3
}

export const LoopTypes = {
    LOOP: 1,
    PLUS_LOOP: 2,
    UNTIL: 3,
    WHILE_REPEAT: 4
}