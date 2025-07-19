import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { CHUNKING_CONFIG } from '../config'
import { logger } from '../utils/logger'
import { validateText } from '../utils/validation'

export class TextProcessingService {
    private splitter: RecursiveCharacterTextSplitter

    constructor() {
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: CHUNKING_CONFIG.chunkSize,
            chunkOverlap: CHUNKING_CONFIG.chunkOverlap
        })
    }

    async splitText(text: string): Promise<string[]> {
        validateText(text, 1)

        try {
            logger.debug(`Splitting text of length: ${text.length}`)
            
            const chunks = await this.splitter.splitText(text)
            
            // Filter out very short chunks
            const filteredChunks = chunks.filter(chunk => chunk.trim().length > 10)
            
            logger.debug(`Split into ${filteredChunks.length} chunks (filtered from ${chunks.length})`)
            
            return filteredChunks
        } catch (error) {
            logger.error('Failed to split text', error)
            throw error
        }
    }

    async splitMultipleTexts(texts: Map<string, string>): Promise<Map<string, string[]>> {
        const results = new Map<string, string[]>()
        
        logger.info(`Processing ${texts.size} texts for chunking`)
        
        for (const [key, text] of texts.entries()) {
            if (!text || text.trim().length === 0) {
                logger.debug(`Skipping empty text for key: ${key}`)
                results.set(key, [])
                continue
            }

            try {
                const chunks = await this.splitText(text)
                results.set(key, chunks)
            } catch (error) {
                logger.error(`Failed to split text for key ${key}:`, error)
                results.set(key, [])
            }
        }
        
        const totalChunks = Array.from(results.values()).reduce((sum, chunks) => sum + chunks.length, 0)
        logger.info(`Text processing completed: ${totalChunks} total chunks from ${texts.size} texts`)
        
        return results
    }

    getChunkingConfig(): { chunkSize: number; chunkOverlap: number } {
        return {
            chunkSize: CHUNKING_CONFIG.chunkSize,
            chunkOverlap: CHUNKING_CONFIG.chunkOverlap
        }
    }

    estimateTokens(text: string): number {
        // Rough estimation: ~4 characters per token for English text
        return Math.ceil(text.length / 4)
    }

    cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .replace(/[^\w\s\-.,!?()]/g, '') // Remove special characters except basic punctuation
            .trim()
    }
}