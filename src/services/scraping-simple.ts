import { logger } from '../utils/logger'
import { validateUrl } from '../utils/validation'

export class SimpleScrapingService {
    async scrapePage(url: string): Promise<string> {
        validateUrl(url)
        
        try {
            logger.info(`Scraping ${url} with simple fetch`)
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; AssistBot/1.0)'
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const html = await response.text()
            const cleanContent = this.cleanHtmlContent(html)
            
            logger.info(`Successfully scraped ${url}, content length: ${cleanContent.length}`)
            return cleanContent
            
        } catch (error) {
            logger.error(`Failed to scrape ${url}:`, error)
            return ''
        }
    }

    private cleanHtmlContent(html: string): string {
        // Remove script and style tags and their content
        let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        
        // Remove HTML tags and replace with pipe separator
        content = content.replace(/<[^>]*>?/gm, '|')
            .replace(/\|+/g, '|') // Replace multiple pipes with single pipe
            .replace(/^\||\|$/g, '') // Remove leading/trailing pipes
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .trim()
        
        return content
    }

    async scrapeMultiplePages(urls: string[]): Promise<Map<string, string>> {
        const results = new Map<string, string>()
        
        logger.info(`Starting batch scraping of ${urls.length} URLs`)
        
        for (const [index, url] of urls.entries()) {
            logger.info(`Processing URL ${index + 1}/${urls.length}: ${url}`)
            
            try {
                const content = await this.scrapePage(url)
                results.set(url, content)
                
                if (content.length === 0) {
                    logger.warn(`No content scraped from ${url}`)
                }
                
                // Add delay between requests to be respectful
                if (index < urls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
                
            } catch (error) {
                logger.error(`Failed to scrape ${url}:`, error)
                results.set(url, '')
            }
        }
        
        const successCount = Array.from(results.values()).filter(content => content.length > 0).length
        logger.info(`Batch scraping completed. Successfully scraped ${successCount} out of ${urls.length} URLs`)
        
        return results
    }

    validateUrls(urls: string[]): { valid: string[]; invalid: string[] } {
        const valid: string[] = []
        const invalid: string[] = []

        for (const url of urls) {
            try {
                validateUrl(url)
                valid.push(url)
            } catch {
                invalid.push(url)
            }
        }

        if (invalid.length > 0) {
            logger.warn(`Found ${invalid.length} invalid URLs`, invalid)
        }

        return { valid, invalid }
    }
}