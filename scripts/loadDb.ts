import {DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import OpenAi from "openai"

import { RecursiveCharacterTextSplitter} from "langchain/text_splitter";

import "dotenv/config"
import {async} from "rxjs";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env

const openAi = new OpenAi({apiKey: OPENAI_API_KEY})

const mercedCollege = [

    /*CSU Humboldt */ 'https://assist.org/transfer/results/preview?year=74&institution=17&agreement=115&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=74%2F17%2Fto%2F115%2FAllMajors',
    /*CSU Pomona */  'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=75&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F75%2FAllMajors',
    /*CSU SLO */  'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=11&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F11%2FAllMajors',
    /*CSU Bakersfield */  'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=98&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F98%2FAllMajors',
    /*CSU Channel Islands */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=143&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F143%2FAllMajors',
    /*CSU Chico */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=141&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F141%2FAllMajors',
    /*CSU Dominguez Hills */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=50&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F50%2FAllMajors',
    /*CSU East Bay */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=21&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F21%2FAllMajors',
    /*CSU Fresno */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=29&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F29%2FAllMajors',
    /*CSU Fullerton */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=129&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F129%2FAllMajors',
    /*CSU Long Beach */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=81&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F81%2FAllMajors',
    /*CSU Los Angeles */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=76&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F76%2FAllMajors',
    /*CSU Maritime Academy */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=1&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F1%2FAllMajors',
    /*CSU Monterey Bay */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=12&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F12%2FAllMajors',
    /*CSU Northridge */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=42&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F42%2FAllMajors',
    /*CSU Sac */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=60&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F60%2FAllMajors',
    /*CSU San Bernardino */
    /*CSU San Marcos */
    /*CSU San Stanislaus */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=24&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F24%2FAllMajors',
    /*CSU San Diego */
    /*CSU San Francisco */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=116&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F116%2FAllMajors',
    /* SJSU */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=39&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F39%2FAllMajors',
    /*CSU Sonoma */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=88&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F88%2FAllMajors',

    /* ---------------------------------------------------------------------- */

    /*UC Berkeley */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=79&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F79%2FAllMajors',
    /*UC Davis */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=89&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F89%2FAllMajors',
    /*UC Irvine */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=120&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F120%2FAllMajors',
    /*UCLA */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=117&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F117%2FAllMajors',
    /*UC Merced */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=144&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F144%2FAllMajors',
    /*UC Riverside */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=46&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F46%2FAllMajors',
    /*UC San Diego */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=7&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F7%2FAllMajors',
    /*UC Santa Barbara */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=128&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F128%2FAllMajors',
    /*UC Santa Cruz */ 'https://assist.org/transfer/results/preview?year=75&institution=17&agreement=132&agreementType=to&viewAgreementsOptions=true&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=75%2F17%2Fto%2F132%2FAllMajors',


]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db= client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createColletion = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of mercedCollege) {
        if (!url || url.trim() === '') {
            console.log('Skipping empty URL')
            continue
        }
        const content = await scrapePage(url)
        const chuncks = await splitter.splitText(content)
        for await (const chunck of chuncks) {
            const embedding = await openAi.embeddings.create({
                model: "text-embedding-3-small",
                input: chunck,
                encoding_format: "float",
            })

            const vector = embedding.data[0].embedding

            const res = await collection.insertOne({
                $vector: vector,
                text: chunck
            })
            console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
        const loader = new PuppeteerWebBaseLoader(url, {
            launchOptions: {
                headless: true
            },
            gotoOptions:{
                waitUntil: "domcontentloaded"
            },
            evaluate: async (page, browser) => {
                const result = await page.evaluate(() => document.body.innerHTML)
                await browser.close()
                return result
            }
        })
        return (await loader.scrape())?.replace(/<[^>]*>?/gm, '|')
}

createColletion().then(() => loadSampleData())
