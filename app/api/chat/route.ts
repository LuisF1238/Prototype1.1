import OpenAI from "openai";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY,
} = process.env;

const openAI = new OpenAI({
    apiKey: OPENAI_API_KEY!,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const latestMessage = messages[messages.length - 1]?.content;
        
        if (!latestMessage) {
            return new Response('No message provided', { status: 400 });
        }
        
        console.log('Processing message:', latestMessage);

        let docContext = "";

        const embeddings = await openAI.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float",
        });

        try {
            const collection = db.collection(ASTRA_DB_COLLECTION!);
            const cursor = collection.find(null, {
                sort: {
                    $vector: embeddings.data[0].embedding,
                },
                limit: 10,
            });

            const documents = await cursor.toArray();
            const docMap = documents.map((doc) => doc.text);
            docContext = JSON.stringify(docMap);
        } catch (err) {
            console.log("Error querying DB:", err);
            docContext = "";
        }

        const systemMessage = {
            role: "system" as const,
            content: `You are: an AI College Transfer Counselor embedded in our student portal.
            Primary mission: design clear, personalized transfer roadmaps that guide community‑college 
            students from their current institution to a target 4‑year university, while maximizing credit 
            applicability, minimizing time‑to‑degree, and meeting all admission requirements.
            If the context doesn't include the information you need, answer based on your 
            existing knowledge and don't mention the source of your information or 
            what the context does or doesn't include.
            Format responses using markdown where applicable and don't return images.
            
            START CONTEXT
            ___________________
            ${docContext}
            END CONTEXT
            ___________________
            
            QUESTION: ${latestMessage}
            ___________________
        `
        };
        const result = streamText({
            model: openai("gpt-4o-mini"),
            messages: [systemMessage, ...messages],
        });

        return result.toDataStreamResponse();
    } catch (err) {
        console.error('API Error:', err);
        return new Response('Internal server error', { status: 500 });
    }
}
