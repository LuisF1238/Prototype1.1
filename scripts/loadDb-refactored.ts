#!/usr/bin/env ts-node

/**
 * Data Loading Script
 * 
 * This script loads university transfer data from ASSIST.org into a vector database.
 * It uses the refactored services for better organization and maintainability.
 */

import 'dotenv/config'
import { DataLoaderService } from '../src/lib/data-loader'
import { logger } from '../src/utils'

async function main(): Promise<void> {
    logger.info('🚀 Starting Data Loading Process')
    
    const dataLoader = new DataLoaderService()

    try {
        // Initialize services
        await dataLoader.initialize()

        // Show current progress
        const progress = await dataLoader.getProgress()
        logger.info(`Current Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)`)

        // Validate URLs before processing
        const urlValidation = await dataLoader.validateUrls()
        logger.info(`URL Validation: ${urlValidation.valid} valid, ${urlValidation.invalid} invalid`)

        if (urlValidation.invalid > 0) {
            logger.warn('Some URLs are invalid:', (urlValidation.details as { invalidUrls: string[] }).invalidUrls)
        }

        // Load all university data
        await dataLoader.loadAllUniversityData()

        // Show final progress
        const finalProgress = await dataLoader.getProgress()
        logger.info(`Final Progress: ${finalProgress.completed}/${finalProgress.total} (${finalProgress.percentage}%)`)

        logger.info('✅ Data loading completed successfully!')

    } catch (error) {
        logger.error('❌ Data loading failed:', error)
        process.exit(1)
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT. Gracefully shutting down...')
    process.exit(0)
})

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Gracefully shutting down...')
    process.exit(0)
})

// Run the script
if (require.main === module) {
    main()
}