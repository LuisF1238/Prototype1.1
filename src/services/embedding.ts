import OpenAI from "openai"
import { OPENAI_CONFIG, validateOpenAIConfig } from '../config'
import { logger } from '../utils/logger'
import { validateText } from '../utils/validation'

export class EmbeddingService {
    private client: OpenAI

    constructor() {
        validateOpenAIConfig()
        this.client = new OpenAI({ apiKey: OPENAI_CONFIG.apiKey })
    }

    async generateEmbedding(text: string): Promise<number[]> {
        validateText(text, 1)

        try {
            logger.debug(`Generating embedding for text of length: ${text.length}`)
            
            const response = await this.client.embeddings.create({
                model: OPENAI_CONFIG.embeddingModel,
                input: text,
                encoding_format: "float",
            })

            const embedding = response.data[0].embedding
            logger.debug(`Generated embedding with ${embedding.length} dimensions`)
            
            return embedding
        } catch (error) {
            logger.error('Failed to generate embedding', error)
            throw error
        }
    }

    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error('Texts must be a non-empty array')
        }

        // Validate each text
        texts.forEach(text => validateText(text, 1))

        try {
            logger.debug(`Generating embeddings for ${texts.length} texts`)
            
            const response = await this.client.embeddings.create({
                model: OPENAI_CONFIG.embeddingModel,
                input: texts,
                encoding_format: "float",
            })

            const embeddings = response.data.map(item => item.embedding)
            logger.debug(`Generated ${embeddings.length} embeddings`)
            
            return embeddings
        } catch (error) {
            logger.error('Failed to generate embeddings', error)
            throw error
        }
    }

    getModelInfo(): { model: string; dimensions: number } {
        return {
            model: OPENAI_CONFIG.embeddingModel,
            dimensions: 1536 // text-embedding-3-small dimensions
        }
    }
}