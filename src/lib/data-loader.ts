import { UNIVERSITY_URLS } from '../config'
import { UniversityUrl, DocumentChunk } from '../types'
import { DatabaseService, EmbeddingService, ScrapingService, TextProcessingService } from '../services'
import { ProgressManager, logger } from '../utils'

export class DataLoaderService {
    private databaseService: DatabaseService
    private embeddingService: EmbeddingService
    private scrapingService: ScrapingService
    private textProcessingService: TextProcessingService
    private progressManager: ProgressManager

    constructor() {
        this.databaseService = new DatabaseService()
        this.embeddingService = new EmbeddingService()
        this.scrapingService = new ScrapingService()
        this.textProcessingService = new TextProcessingService()
        this.progressManager = new ProgressManager()
    }

    async initialize(): Promise<void> {
        logger.info('Initializing Data Loader Service...')
        
        try {
            await this.databaseService.createCollection()
            logger.info('Database collection ready')
        } catch (error) {
            logger.error('Failed to initialize database collection', error)
            throw error
        }
    }

    async loadAllUniversityData(): Promise<void> {
        const completedUrls = this.progressManager.loadProgress()
        const urls = UNIVERSITY_URLS.map(u => u.url).filter(url => url && url.trim())
        const pendingUrls = urls.filter(url => !completedUrls.has(url))

        logger.info(`Starting data loading process`)
        logger.info(`Total URLs: ${urls.length}`)
        logger.info(`Already completed: ${completedUrls.size}`)
        logger.info(`Pending: ${pendingUrls.length}`)

        if (pendingUrls.length === 0) {
            logger.info('All URLs have already been processed!')
            return
        }

        let processedCount = 0
        for (const url of pendingUrls) {
            processedCount++
            
            try {
                const university = UNIVERSITY_URLS.find(u => u.url === url)
                logger.info(`Processing ${processedCount}/${pendingUrls.length}: ${university?.name || url}`)

                const success = await this.processUrl(url, university)
                
                if (success) {
                    completedUrls.add(url)
                    this.progressManager.saveProgress(completedUrls, urls.length)
                }

                // Progress update
                const stats = this.progressManager.getProgressStats(completedUrls, urls.length)
                logger.info(`Progress: ${stats.completed}/${urls.length} (${stats.percentage}%) completed`)

            } catch (error) {
                logger.error(`Failed to process URL: ${url}`, error)
                // Continue with next URL instead of stopping
            }
        }

        logger.info('🎉 Data loading process completed!')
        
        try {
            const stats = await this.databaseService.getCollectionStats()
            logger.info(`Final database stats:`, stats)
        } catch (error) {
            logger.warn('Could not retrieve final database stats', error)
        }
    }

    private async processUrl(url: string, university?: UniversityUrl): Promise<boolean> {
        try {
            // Step 1: Scrape content
            const content = await this.scrapingService.scrapePage(url)
            
            if (!content || content.trim().length === 0) {
                logger.warn(`No content scraped from ${url}`)
                return false
            }

            // Step 2: Split into chunks
            const chunks = await this.textProcessingService.splitText(content)
            
            if (chunks.length === 0) {
                logger.warn(`No chunks created from ${url}`)
                return false
            }

            logger.info(`Split content into ${chunks.length} chunks`)

            // Step 3: Process each chunk
            for (const [index, chunk] of chunks.entries()) {
                await this.processChunk(chunk, index + 1, chunks.length, university)
            }

            logger.info(`✅ Successfully processed ${url}`)
            return true

        } catch (error) {
            logger.error(`Error processing ${url}:`, error)
            return false
        }
    }

    private async processChunk(
        text: string, 
        chunkIndex: number, 
        totalChunks: number,
        university?: UniversityUrl
    ): Promise<void> {
        try {
            logger.debug(`Processing chunk ${chunkIndex}/${totalChunks}`)

            // Generate embedding
            const vector = await this.embeddingService.generateEmbedding(text)

            // Create document chunk with metadata
            const documentChunk: DocumentChunk = {
                text,
                vector,
                metadata: {
                    chunkIndex,
                    totalChunks,
                    university: university?.name,
                    universityType: university?.type,
                    agreementId: university?.agreementId,
                    sourceUrl: university?.url,
                    processedAt: new Date().toISOString()
                }
            }

            // Insert into database
            const insertedId = await this.databaseService.insertDocument(documentChunk)
            logger.debug(`Inserted chunk ${chunkIndex}/${totalChunks} with ID: ${insertedId}`)

        } catch (error) {
            logger.error(`Failed to process chunk ${chunkIndex}/${totalChunks}:`, error)
            throw error
        }
    }

    async clearProgress(): Promise<void> {
        this.progressManager.clearProgress()
        logger.info('Progress cleared')
    }

    async getProgress(): Promise<{
        completed: number
        total: number
        percentage: number
        remaining: number
    }> {
        const completedUrls = this.progressManager.loadProgress()
        const totalUrls = UNIVERSITY_URLS.length
        const stats = this.progressManager.getProgressStats(completedUrls, totalUrls)

        return {
            completed: stats.completed,
            total: totalUrls,
            percentage: stats.percentage,
            remaining: stats.remaining
        }
    }

    async validateUrls(): Promise<{ valid: number; invalid: number; details: unknown }> {
        const urls = UNIVERSITY_URLS.map(u => u.url)
        const { valid, invalid } = this.scrapingService.validateUrls(urls)

        return {
            valid: valid.length,
            invalid: invalid.length,
            details: {
                invalidUrls: invalid,
                totalUrls: urls.length
            }
        }
    }
}