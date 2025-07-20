import { DataAPIClient } from "@datastax/astra-db-ts"
import { DATABASE_CONFIG, validateDatabaseConfig } from '../config'
import { DocumentChunk, VectorSearchResult } from '../types'
import { logger } from '../utils/logger'
import { validateEmbedding, validateText } from '../utils/validation'

export class DatabaseService {
    private client: DataAPIClient
    private db: unknown
    private collection: unknown

    constructor() {
        validateDatabaseConfig()
        
        this.client = new DataAPIClient(DATABASE_CONFIG.token)
        this.db = this.client.db(DATABASE_CONFIG.apiEndpoint, { 
            namespace: DATABASE_CONFIG.namespace 
        })
    }

    async createCollection(): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await (this.db as any).createCollection(DATABASE_CONFIG.collection, {
                vector: {
                    dimension: DATABASE_CONFIG.vectorDimension,
                    metric: DATABASE_CONFIG.similarityMetric
                }
            })
            logger.info('Collection created successfully', res)
        } catch (error: unknown) {
            if ((error as Error).message?.includes('already exists')) {
                logger.info(`Collection '${DATABASE_CONFIG.collection}' already exists, continuing...`)
            } else {
                logger.error('Failed to create collection', error)
                throw error
            }
        }
    }

    private getCollection(): unknown {
        if (!this.collection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.collection = (this.db as any).collection(DATABASE_CONFIG.collection)
        }
        return this.collection
    }

    async insertDocument(chunk: DocumentChunk): Promise<unknown> {
        validateText(chunk.text)
        validateEmbedding(chunk.vector)

        try {
            const collection = this.getCollection()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await (collection as any).insertOne({
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cursor = (collection as any).find(null, {
                sort: {
                    $vector: queryVector,
                },
                limit: limit,
            })

            const documents = await cursor.toArray()
            
            return documents.map((doc: Record<string, unknown>) => ({
                text: doc.text as string,
                score: doc.$similarity as number,
                metadata: {
                    id: doc._id as string,
                    ...Object.keys(doc)
                        .filter(key => !['text', '$similarity', '_id', '$vector'].includes(key))
                        .reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {} as Record<string, unknown>)
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stats = await (collection as any).estimatedDocumentCount()
            return { estimatedDocumentCount: stats }
        } catch (error) {
            logger.error('Failed to get collection stats', error)
            throw error
        }
    }

    async deleteCollection(): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (this.db as any).dropCollection(DATABASE_CONFIG.collection)
            logger.info('Collection deleted successfully')
        } catch (error) {
            logger.error('Failed to delete collection', error)
            throw error
        }
    }
}