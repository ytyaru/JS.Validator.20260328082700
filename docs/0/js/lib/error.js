export class ValidationError extends Error {
    constructor(name, cause) {
        super(name, cause instanceof Error ? {cause} : undefined);
        this.name = 'ValidationError';
    }
}

