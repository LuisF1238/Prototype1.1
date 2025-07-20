import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { ChatService } from '../../../src/lib/chat-service'
import { OPENAI_CONFIG } from '../../../src/config'
import { logger } from '../../../src/utils'
import { ChatRequest } from '../../../src/types'

const chatService = new ChatService()

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body: ChatRequest = await req.json()
        const { messages } = body

        if (!messages || messages.length === 0) {
            logger.warn('No messages provided in request')
            return NextResponse.json(
                { error: 'No messages provided' },
                { status: 400 }
            )
        }

        const latestMessage = messages[messages.length - 1]?.content

        if (!latestMessage) {
            logger.warn('Latest message is empty')
            return NextResponse.json(
                { error: 'Latest message is empty' },
                { status: 400 }
            )
        }

        logger.info(`Processing chat message: "${latestMessage.substring(0, 100)}..."`)

        // Process the user message and get context
        const { systemMessage } = await chatService.processUserMessage(latestMessage)

        // Generate streaming response
        const result = streamText({
            model: openai(OPENAI_CONFIG.model),
            messages: [systemMessage, ...messages],
        })

        logger.info('Chat response generated successfully')
        return result.toDataStreamResponse()

    } catch (error) {
        logger.error('Chat API error:', error)

        // Return appropriate error response based on error type
        if (error instanceof Error) {
            if (error.message.includes('validation')) {
                return NextResponse.json(
                    { error: 'Invalid request data' },
                    { status: 400 }
                )
            }
            
            if (error.message.includes('database') || error.message.includes('collection')) {
                return NextResponse.json(
                    { error: 'Database service unavailable' },
                    { status: 503 }
                )
            }

            if (error.message.includes('embedding') || error.message.includes('openai')) {
                return NextResponse.json(
                    { error: 'AI service unavailable' },
                    { status: 503 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Health check endpoint
export async function GET(): Promise<Response> {
    try {
        // Check if services are healthy
        const collectionInfo = await chatService.getCollectionInfo()
        
        logger.info('Health check passed')
        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'operational',
                embedding: 'operational',
                documentCount: collectionInfo.documentCount
            }
        })

    } catch (error) {
        logger.error('Health check failed:', error)
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Service unavailable'
            },
            { status: 503 }
        )
    }
}