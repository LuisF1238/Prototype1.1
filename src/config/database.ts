import { DatabaseConfig, SimilarityMetric } from '../types'

export const DATABASE_CONFIG: DatabaseConfig = {
    namespace: process.env.ASTRA_DB_NAMESPACE || '',
    collection: process.env.ASTRA_DB_COLLECTION || '',
    apiEndpoint: process.env.ASTRA_DB_API_ENDPOINT || '',
    token: process.env.ASTRA_DB_APPLICATION_TOKEN || '',
    vectorDimension: 1536,
    similarityMetric: "dot_product" as SimilarityMetric
}

export const validateDatabaseConfig = (): void => {
    const requiredFields = ['namespace', 'collection', 'apiEndpoint', 'token']
    
    for (const field of requiredFields) {
        if (!DATABASE_CONFIG[field as keyof DatabaseConfig]) {
            throw new Error(`Missing required database configuration: ${field}`)
        }
    }
}