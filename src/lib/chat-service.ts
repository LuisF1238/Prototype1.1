import { DatabaseService, EmbeddingService } from '../services'
import { VectorSearchResult, ChatMessage } from '../types'
import { logger } from '../utils'

export class ChatService {
    private databaseService: DatabaseService
    private embeddingService: EmbeddingService

    constructor() {
        this.databaseService = new DatabaseService()
        this.embeddingService = new EmbeddingService()
    }

    async searchSimilarContent(query: string, limit: number = 10): Promise<VectorSearchResult[]> {
        try {
            logger.debug(`Searching for similar content: "${query}" (limit: ${limit})`)

            // Generate embedding for the query
            const queryEmbedding = await this.embeddingService.generateEmbedding(query)

            // Search for similar vectors in database
            const results = await this.databaseService.vectorSearch(queryEmbedding, limit)

            logger.debug(`Found ${results.length} similar documents`)
            
            return results

        } catch (error) {
            logger.error('Failed to search similar content', error)
            throw error
        }
    }

    formatContextForChat(searchResults: VectorSearchResult[]): string {
        if (searchResults.length === 0) {
            return "No relevant context found in the database."
        }

        const contexts = searchResults.map((result, index) => {
            const university = result.metadata?.university || 'Unknown University'
            const universityType = result.metadata?.universityType || ''
            const score = result.score ? ` (relevance: ${(result.score * 100).toFixed(1)}%)` : ''
            
            return `Context ${index + 1} - ${university} (${universityType})${score}:\n${result.text}`
        })

        return contexts.join('\n\n---\n\n')
    }

    createSystemMessage(context: string, userQuery: string): ChatMessage {
        return {
            role: 'system',
            content: `You are: an Expert AI College Transfer Counselor embedded in our student portal.
            Primary mission: design clear, personalized transfer roadmaps that guide community‑college 
            students from their current institution to a target 4‑year university and meeting all admission requirements.
            If the context doesn't include the information you need, ask for further details, and always say where the 
            source of your information is from.
            Your responses should be concise, actionable, and tailored to the student's specific situation.

            when listing course always list the Community college course required, and an arrow to what it transfer to, with the full Community college course.
            Eg: (Math -04A Calculus 1 ——>  Math 1A Calculus )
            Eg: (MATH -06 Elementary Differential Equations and MATH -08 Linear Algebra ——>  Math 54 Linear Algebra and Differential Equations)
            
            START CONTEXT
            ___________________
            ${context}
            END CONTEXT
            ___________________
            
            QUESTION: ${userQuery}
            ___________________`
        }
    }

    async processUserMessage(userMessage: string, messageHistory: ChatMessage[] = []): Promise<{
        systemMessage: ChatMessage
        context: VectorSearchResult[]
        formattedContext: string
    }> {
        try {
            // Search for relevant content
            const searchResults = await this.searchSimilarContent(userMessage, 10)

            // Format context for chat
            const formattedContext = this.formatContextForChat(searchResults)

            // Create system message
            const systemMessage = this.createSystemMessage(formattedContext, userMessage)

            return {
                systemMessage,
                context: searchResults,
                formattedContext
            }

        } catch (error) {
            logger.error('Failed to process user message', error)
            throw error
        }
    }

    async getCollectionInfo(): Promise<{
        documentCount: number
        embeddingModel: string
        vectorDimensions: number
    }> {
        try {
            const stats = await this.databaseService.getCollectionStats()
            const modelInfo = this.embeddingService.getModelInfo()

            return {
                documentCount: stats.estimatedDocumentCount,
                embeddingModel: modelInfo.model,
                vectorDimensions: modelInfo.dimensions
            }

        } catch (error) {
            logger.error('Failed to get collection info', error)
            throw error
        }
    }
}