import { ServiceError } from '../types'

export class ValidationError extends Error {
    constructor(
        message: string,
        public field: string,
        public code: string = 'VALIDATION_ERROR'
    ) {
        super(message)
        this.name = 'ValidationError'
    }
}

export const validateUrl = (url: string): void => {
    if (!url || typeof url !== 'string') {
        throw new ValidationError('URL is required and must be a string', 'url')
    }

    try {
        new URL(url)
    } catch {
        throw new ValidationError('Invalid URL format', 'url')
    }
}

export const validateEmbedding = (embedding: number[]): void => {
    if (!Array.isArray(embedding)) {
        throw new ValidationError('Embedding must be an array', 'embedding')
    }

    if (embedding.length === 0) {
        throw new ValidationError('Embedding cannot be empty', 'embedding')
    }

    if (!embedding.every(num => typeof num === 'number' && !isNaN(num))) {
        throw new ValidationError('Embedding must contain only valid numbers', 'embedding')
    }
}

export const validateText = (text: string, minLength: number = 1): void => {
    if (!text || typeof text !== 'string') {
        throw new ValidationError('Text is required and must be a string', 'text')
    }

    if (text.trim().length < minLength) {
        throw new ValidationError(`Text must be at least ${minLength} characters long`, 'text')
    }
}

export const createServiceError = (
    code: string,
    message: string,
    details?: unknown
): ServiceError => {
    return {
        code,
        message,
        details
    }
}