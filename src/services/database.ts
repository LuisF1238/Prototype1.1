import { DataAPIClient } from "@datastax/astra-db-ts"
import { DATABASE_CONFIG, validateDatabaseConfig } from '../config'
import { DocumentChunk, VectorSearchResult } from '../types'
import { logger } from '../utils/logger'
import { validateEmbedding, validateText } from '../utils/validation'

export class DatabaseService {
    private client: DataAPIClient
    private db: any
    private collection: any

    constructor() {
        validateDatabaseConfig()
        
        this.client = new DataAPIClient(DATABASE_CONFIG.token)
        this.db = this.client.db(DATABASE_CONFIG.apiEndpoint, { 
            namespace: DATABASE_CONFIG.namespace 
        })
    }

    async createCollection(): Promise<void> {
        try {
            const res = await this.db.createCollection(DATABASE_CONFIG.collection, {
                vector: {
                    dimension: DATABASE_CONFIG.vectorDimension,
                    metric: DATABASE_CONFIG.similarityMetric
                }
            })
            logger.info('Collection created successfully', res)
        } catch (error: any) {
            if (error.message?.includes('already exists')) {
                logger.info(`Collection '${DATABASE_CONFIG.collection}' already exists, continuing...`)
            } else {
                logger.error('Failed to create collection', error)
                throw error
            }
        }
    }

    private getCollection() {
        if (!this.collection) {
            this.collection = this.db.collection(DATABASE_CONFIG.collection)
        }
        return this.collection
    }

    async insertDocument(chunk: DocumentChunk): Promise<unknown> {
        validateText(chunk.text)
        validateEmbedding(chunk.vector)

        try {
            const collection = this.getCollection()
            const res = await collection.insertOne({
                $vector: chunk.vector,
                text: chunk.text,
                ...chunk.metadata
            })

            logger.debug(`Document inserted with ID: ${res.insertedId}`)
            return res.insertedId
        } catch (error) {
            logger.error('Failed to insert document', error)
            throw error
        }
    }

    async vectorSearch(
        queryVector: number[], 
        limit: number = 10
    ): Promise<VectorSearchResult[]> {
        validateEmbedding(queryVector)

        try {
            const collection = this.getCollection()
            const cursor = collection.find(null, {
                sort: {
                    $vector: queryVector,
                },
                limit: limit,
            })

            const documents = await cursor.toArray()
            
            return documents.map((doc: any) => ({
                text: doc.text,
                score: doc.$similarity,
                metadata: {
                    id: doc._id,
                    ...Object.keys(doc)
                        .filter(key => !['text', '$similarity', '_id', '$vector'].includes(key))
                        .reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {})
                }
            }))
        } catch (error) {
            logger.error('Vector search failed', error)
            throw error
        }
    }

    async getCollectionStats(): Promise<{ estimatedDocumentCount: number }> {
        try {
            const collection = this.getCollection()
            const stats = await collection.estimatedDocumentCount()
            return { estimatedDocumentCount: stats }
        } catch (error) {
            logger.error('Failed to get collection stats', error)
            throw error
        }
    }

    async deleteCollection(): Promise<void> {
        try {
            await this.db.dropCollection(DATABASE_CONFIG.collection)
            logger.info('Collection deleted successfully')
        } catch (error) {
            logger.error('Failed to delete collection', error)
            throw error
        }
    }
}