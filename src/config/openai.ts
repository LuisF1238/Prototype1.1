import { OpenAIConfig } from '../types'

export const OPENAI_CONFIG: OpenAIConfig = {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: "gpt-4.1-nano-2025-04-14",
    embeddingModel: "text-embedding-3-small"
}

export const validateOpenAIConfig = (): void => {
    if (!OPENAI_CONFIG.apiKey) {
        throw new Error('Missing required OpenAI API key')
    }
}