import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import { SCRAPING_CONFIG } from '../config'
import { logger } from '../utils/logger'
import { validateUrl } from '../utils/validation'

export class ScrapingService {
    async scrapePage(url: string): Promise<string> {
        validateUrl(url)
        
        const { retries, timeout, waitTime, delayBetweenAttempts } = SCRAPING_CONFIG
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                logger.info(`Scraping ${url} (attempt ${attempt}/${retries})`)
                
                const loader = new PuppeteerWebBaseLoader(url, {
                    launchOptions: {
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox']
                    },
                    gotoOptions: {
                        waitUntil: "domcontentloaded",
                        timeout: timeout
                    },
                    evaluate: async (page, browser) => {
                        // Wait for content to load
                        await new Promise(resolve => setTimeout(resolve, waitTime))
                        
                        // Extract content
                        const result = await page.evaluate(() => document.body.innerHTML)
                        await browser.close()
                        return result
                    }
                })
                
                const content = await loader.scrape()
                const cleanContent = this.cleanHtmlContent(content || '')
                
                logger.info(`Successfully scraped ${url}, content length: ${cleanContent.length}`)
                return cleanContent
                
            } catch (error) {
                logger.warn(`Attempt ${attempt} failed for ${url}:`, error)
                
                if (attempt === retries) {
                    logger.error(`All ${retries} attempts failed for ${url}`)
                    return ''
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts))
            }
        }
        
        return ''
    }

    private cleanHtmlContent(html: string): string {
        // Remove HTML tags and replace with pipe separator
        return html.replace(/<[^>]*>?/gm, '|')
            .replace(/\|+/g, '|') // Replace multiple pipes with single pipe
            .replace(/^\||\|$/g, '') // Remove leading/trailing pipes
            .trim()
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
                
            } catch (error) {
                logger.error(`Failed to scrape ${url}:`, error)
                results.set(url, '')
            }
        }
        
        logger.info(`Batch scraping completed. Successfully scraped ${Array.from(results.values()).filter(content => content.length > 0).length} out of ${urls.length} URLs`)
        
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