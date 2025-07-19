import { ScrapingConfig, ChunkingConfig } from '../types'

export const SCRAPING_CONFIG: ScrapingConfig = {
    retries: 3,
    timeout: 60000,
    waitTime: 5000,
    delayBetweenAttempts: 2000
}

export const CHUNKING_CONFIG: ChunkingConfig = {
    chunkSize: 512,
    chunkOverlap: 100
}