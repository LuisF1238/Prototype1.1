// Database types
export interface DatabaseConfig {
    namespace: string
    collection: string
    apiEndpoint: string
    token: string
    vectorDimension: number
    similarityMetric: SimilarityMetric
}

export interface OpenAIConfig {
    apiKey: string
    model: string
    embeddingModel: string
}

export interface ScrapingConfig {
    retries: number
    timeout: number
    waitTime: number
    delayBetweenAttempts: number
}

export interface ChunkingConfig {
    chunkSize: number
    chunkOverlap: number
}

export type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

// Progress tracking
export interface ProgressData {
    completedUrls: string[]
    totalUrls: number
    lastUpdated: string
}

// Document and embedding types
export interface DocumentChunk {
    text: string
    vector: number[]
    metadata?: Record<string, unknown>
}

export interface VectorSearchResult {
    text: string
    score?: number
    metadata?: Record<string, unknown>
}

// API types
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface ChatRequest {
    messages: ChatMessage[]
}

export interface UniversityUrl {
    url: string
    name: string
    type: 'CSU' | 'UC' | 'Private'
    agreementId: string
}

// Error types
export interface ServiceError {
    code: string
    message: string
    details?: unknown
}