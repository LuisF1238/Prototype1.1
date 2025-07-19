import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import OpenAI from "openai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import "dotenv/config"
import * as fs from 'fs'
import * as path from 'path'

// ============================
// TYPES & INTERFACES
// ============================

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

interface ProgressData {
    completedUrls: string[]
}

interface ScrapingConfig {
    retries: number
    timeout: number
    waitTime: number
}

interface ChunkingConfig {
    chunkSize: number
    chunkOverlap: number
}

// ============================
// CONFIGURATION
// ============================

const CONFIG = {
    database: {
        namespace: process.env.ASTRA_DB_NAMESPACE,
        collection: process.env.ASTRA_DB_COLLECTION,
        apiEndpoint: process.env.ASTRA_DB_API_ENDPOINT,
        token: process.env.ASTRA_DB_APPLICATION_TOKEN,
        vectorDimension: 1536,
        similarityMetric: "dot_product" as SimilarityMetric
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-small" as const
    },
    scraping: {
        retries: 3,
        timeout: 60000,
        waitTime: 5000
    } as ScrapingConfig,
    chunking: {
        chunkSize: 512,
        chunkOverlap: 100
    } as ChunkingConfig,
    files: {
        progressFile: path.join(__dirname, 'scraping-progress.json')
    }
}

// ============================
// CONSTANTS
// ============================

const MERCED_COLLEGE_URLS = [
    // CSU Universities
    'https://assist.org/transfer/results/preview?year=74&institution=17&agreement=115&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=74%2F17%2Fto%2F115%2FAllMajors', // CSU Humboldt
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=75&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F75%2FAllMajors', // CSU Pomona
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=11&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F11%2FAllMajors', // CSU SLO
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=98&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F98%2FAllMajors', // CSU Bakersfield
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=143&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F143%2FAllMajors', // CSU Channel Islands
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=141&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F141%2FAllMajors', // CSU Chico
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=50&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F50%2FAllMajors', // CSU Dominguez Hills
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=21&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F21%2FAllMajors', // CSU East Bay
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=29&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F29%2FAllMajors', // CSU Fresno
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=129&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F129%2FAllMajors', // CSU Fullerton
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=81&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F81%2FAllMajors', // CSU Long Beach
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=76&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F76%2FAllMajors', // CSU Los Angeles
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=1&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F1%2FAllMajors', // CSU Maritime Academy
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=12&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F12%2FAllMajors', // CSU Monterey Bay
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=42&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F42%2FAllMajors', // CSU Northridge
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=60&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F60%2FAllMajors', // CSU Sacramento
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=24&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F24%2FAllMajors', // CSU Stanislaus
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=116&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F116%2FAllMajors', // CSU San Francisco
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=39&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F39%2FAllMajors', // SJSU
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=88&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F88%2FAllMajors', // CSU Sonoma

    // UC Universities
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=79&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F79%2FAllMajors', // UC Berkeley
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=89&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F89%2FAllMajors', // UC Davis
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=120&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F120%2FAllMajors', // UC Irvine
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=117&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F117%2FAllMajors', // UCLA
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=144&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F144%2FAllMajors', // UC Merced
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=46&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F46%2FAllMajors', // UC Riverside
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=7&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F7%2FAllMajors', // UC San Diego
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=128&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F128%2FAllMajors', // UC Santa Barbara
    'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=132&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F132%2FAllMajors', // UC Santa Cruz
]

// ============================
// CLIENTS & SERVICES
// ============================

const openAI = new OpenAI({ apiKey: CONFIG.openai.apiKey })
const client = new DataAPIClient(CONFIG.database.token)
const db = client.db(CONFIG.database.apiEndpoint, { namespace: CONFIG.database.namespace })
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.chunking.chunkSize,
    chunkOverlap: CONFIG.chunking.chunkOverlap
})

// ============================
// PROGRESS MANAGEMENT
// ============================

const loadProgress = (): Set<string> => {
    try {
        if (fs.existsSync(CONFIG.files.progressFile)) {
            const data: ProgressData = JSON.parse(fs.readFileSync(CONFIG.files.progressFile, 'utf8'))
            return new Set(data.completedUrls || [])
        }
    } catch {
        console.log('Could not load progress file, starting fresh')
    }
    return new Set()
}

const saveProgress = (completedUrls: Set<string>): void => {
    try {
        const data: ProgressData = { completedUrls: Array.from(completedUrls) }
        fs.writeFileSync(CONFIG.files.progressFile, JSON.stringify(data, null, 2))
    } catch (error) {
        console.log('Could not save progress:', (error as Error).message)
    }
}

// ============================
// DATABASE OPERATIONS
// ============================

const createCollection = async (): Promise<void> => {
    try {
        const res = await db.createCollection(CONFIG.database.collection, {
            vector: {
                dimension: CONFIG.database.vectorDimension,
                metric: CONFIG.database.similarityMetric
            }
        })
        console.log('Collection created:', res)
    } catch (error) {
        const errorMessage = (error as Error).message
        if (errorMessage?.includes('already exists')) {
            console.log(`Collection '${CONFIG.database.collection}' already exists, continuing...`)
        } else {
            throw error
        }
    }
}

const insertChunk = async (text: string, vector: number[]): Promise<unknown> => {
    const collection = db.collection(CONFIG.database.collection)
    const res = await collection.insertOne({
        $vector: vector,
        text: text
    })
    return res.insertedId
}

// ============================
// WEB SCRAPING
// ============================

const scrapePage = async (url: string): Promise<string> => {
    const { retries, timeout, waitTime } = CONFIG.scraping
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Scraping ${url} (attempt ${attempt}/${retries})`)
            
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
                    await new Promise(resolve => setTimeout(resolve, waitTime))
                    const result = await page.evaluate(() => document.body.innerHTML)
                    await browser.close()
                    return result
                }
            })
            
            const content = await loader.scrape()
            return content?.replace(/<[^>]*>?/gm, '|') || ''
            
        } catch (error) {
            console.log(`Attempt ${attempt} failed for ${url}:`, (error as Error).message)
            
            if (attempt === retries) {
                console.log(`All retries failed for ${url}, skipping...`)
                return ''
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
    }
    
    return ''
}

// ============================
// EMBEDDING OPERATIONS
// ============================

const generateEmbedding = async (text: string): Promise<number[]> => {
    const embedding = await openAI.embeddings.create({
        model: CONFIG.openai.model,
        input: text,
        encoding_format: "float",
    })
    return embedding.data[0].embedding
}

// ============================
// MAIN PROCESSING LOGIC
// ============================

const processUrl = async (url: string, completedUrls: Set<string>): Promise<boolean> => {
    console.log(`\n=== Processing URL ===`)
    console.log(`URL: ${url}`)
    
    const content = await scrapePage(url)
    if (!content || content.trim() === '') {
        console.log(`No content scraped, skipping...`)
        return false
    }
    
    const chunks = await textSplitter.splitText(content)
    console.log(`Split into ${chunks.length} chunks`)
    
    for (const [index, chunk] of chunks.entries()) {
        console.log(`Processing chunk ${index + 1}/${chunks.length}`)
        
        const vector = await generateEmbedding(chunk)
        const insertedId = await insertChunk(chunk, vector)
        
        console.log(`Inserted chunk with ID: ${insertedId}`)
    }
    
    completedUrls.add(url)
    saveProgress(completedUrls)
    console.log(`✅ Completed processing: ${url}`)
    
    return true
}

const loadSampleData = async (): Promise<void> => {
    const completedUrls = loadProgress()
    const validUrls = MERCED_COLLEGE_URLS.filter(url => url && url.trim())
    
    console.log(`Found ${completedUrls.size} previously completed URLs`)
    console.log(`Total URLs to process: ${validUrls.length}`)
    
    let processedCount = 0
    
    for (const url of validUrls) {
        if (completedUrls.has(url)) {
            console.log(`Skipping already processed URL: ${url}`)
            continue
        }
        
        processedCount++
        console.log(`\n=== Processing URL ${processedCount} ===`)
        
        try {
            await processUrl(url, completedUrls)
        } catch (error) {
            console.error(`Failed to process URL ${url}:`, (error as Error).message)
            // Continue with next URL instead of stopping
        }
    }
    
    console.log(`\n🎉 Processing complete! Total completed: ${completedUrls.size}`)
}

// ============================
// MAIN EXECUTION
// ============================

const main = async (): Promise<void> => {
    try {
        console.log('Starting database loading process...')
        await createCollection()
        await loadSampleData()
        console.log('Database loading process completed successfully!')
    } catch (error) {
        console.error('Fatal error in main process:', (error as Error).message)
        process.exit(1)
    }
}

main()