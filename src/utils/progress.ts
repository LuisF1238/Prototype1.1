import * as fs from 'fs'
import * as path from 'path'
import { ProgressData } from '../types'
import { logger } from './logger'

export class ProgressManager {
    private progressFile: string

    constructor(progressFileName: string = 'scraping-progress.json') {
        this.progressFile = path.join(process.cwd(), 'scripts', progressFileName)
    }

    loadProgress(): Set<string> {
        try {
            if (fs.existsSync(this.progressFile)) {
                const data: ProgressData = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'))
                logger.info(`Loaded progress: ${data.completedUrls.length} completed URLs`)
                return new Set(data.completedUrls || [])
            }
        } catch (error) {
            logger.warn('Could not load progress file, starting fresh', error)
        }
        return new Set()
    }

    saveProgress(completedUrls: Set<string>, totalUrls: number = 0): void {
        try {
            const data: ProgressData = {
                completedUrls: Array.from(completedUrls),
                totalUrls,
                lastUpdated: new Date().toISOString()
            }
            
            // Ensure directory exists
            const dir = path.dirname(this.progressFile)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            
            fs.writeFileSync(this.progressFile, JSON.stringify(data, null, 2))
            logger.debug(`Progress saved: ${completedUrls.size}/${totalUrls} URLs completed`)
        } catch (error) {
            logger.error('Could not save progress', error)
        }
    }

    getProgressStats(completedUrls: Set<string>, totalUrls: number): {
        completed: number
        remaining: number
        percentage: number
    } {
        const completed = completedUrls.size
        const remaining = totalUrls - completed
        const percentage = totalUrls > 0 ? Math.round((completed / totalUrls) * 100) : 0

        return {
            completed,
            remaining,
            percentage
        }
    }

    clearProgress(): void {
        try {
            if (fs.existsSync(this.progressFile)) {
                fs.unlinkSync(this.progressFile)
                logger.info('Progress file cleared')
            }
        } catch (error) {
            logger.error('Could not clear progress file', error)
        }
    }
}