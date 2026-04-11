import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are StockPilot AI — a friendly, knowledgeable stock market tutor for Indian stock market beginners.

Your role:
- Explain stock market concepts (P/E ratio, market cap, dividends, etc.) in simple language
- Give practical tips for beginner traders
- Discuss Indian market specifics (NSE, BSE, SEBI regulations, trading hours)
- Explain chart patterns, technical and fundamental analysis basics
- Help users understand their portfolio metrics

Rules:
- Keep responses concise (2-4 short paragraphs max)
- Use simple language, avoid jargon or explain it when used
- Use bullet points for lists
- NEVER give specific buy/sell recommendations or financial advice
- Always remind users this is for educational purposes when relevant
- Be encouraging and supportive — the user is learning!
- Use ₹ for currency examples
- Focus on the Indian stock market (NSE/BSE) context`

async function callWithRetry(fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn()
        } catch (err: any) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('retry')
            if (isRateLimit && i < retries - 1) {
                await new Promise(r => setTimeout(r, delay * (i + 1)))
                continue
            }
            throw err
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json()

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages required' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        // Build chat history from messages
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }))

        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
        })

        const lastMessage = messages[messages.length - 1]
        const prompt = messages.length === 1
            ? `${SYSTEM_PROMPT}\n\nUser question: ${lastMessage.content}`
            : lastMessage.content

        const result = await callWithRetry(() => chat.sendMessage(prompt))
        const response = result.response.text()

        return NextResponse.json({ reply: response })
    } catch (err: unknown) {
        console.error('Chat error:', err)
        const message = err instanceof Error ? err.message : 'Chat failed'
        // Surface a user-friendly message for rate limits
        if (message.includes('429') || message.includes('quota') || message.includes('retry')) {
            return NextResponse.json({ error: 'AI is warming up, please try again in a few seconds!' }, { status: 429 })
        }
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
