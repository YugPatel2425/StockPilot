'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles, ChevronDown } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const SUGGESTED_QUESTIONS = [
    'What is a P/E ratio?',
    'How does the NSE work?',
    'What is market cap?',
    'Tips for beginners?',
    'What are mutual funds?',
    'How to read stock charts?',
]

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return

        const userMsg: Message = { role: 'user', content: text.trim() }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            })
            const data = await res.json()
            if (data.reply) {
                setMessages([...newMessages, { role: 'assistant', content: data.reply }])
            } else {
                setMessages([...newMessages, { role: 'assistant', content: data.error || 'Sorry, I couldn\'t process that. Please try again!' }])
            }
        } catch {
            setMessages([...newMessages, { role: 'assistant', content: 'Connection error. Please try again!' }])
        } finally {
            setIsLoading(false)
        }
    }, [messages, isLoading])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    // Format markdown-like content
    const formatContent = (text: string) => {
        return text
            .split('\n')
            .map((line, i) => {
                // Bold
                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Bullet points
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return `<li key="${i}" class="ml-4 list-disc">${formatted.slice(2)}</li>`
                }
                return formatted
            })
            .join('<br/>')
    }

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 duo-btn ${isOpen ? 'duo-btn-red' : 'duo-btn-green'} w-14 h-14 rounded-full p-0 shadow-xl transition-all duration-300 ${isOpen ? 'rotate-0' : 'animate-bounce-in'}`}
                style={{ animationDelay: '1s' }}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] flex flex-col bg-card border-2 border-border border-b-4 rounded-2xl shadow-2xl animate-bounce-in overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-border bg-[var(--duo-green-light)]">
                        <div className="icon-circle icon-circle-green w-10 h-10">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-foreground">StockPilot AI</span>
                            <span className="text-[10px] font-bold text-[var(--duo-green-dark)]">Market Tutor — Ask me anything!</span>
                        </div>
                        <div className="ml-auto duo-badge duo-badge-green text-[10px]">
                            <Sparkles className="h-3 w-3" /> Online
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[280px] max-h-[360px]">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <div className="icon-circle icon-circle-green w-14 h-14 animate-float">
                                    <Bot className="h-7 w-7" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-extrabold text-foreground">Hey! I&apos;m your market tutor 👋</p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">Ask me about stocks, trading, or market concepts</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    {SUGGESTED_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            className="duo-btn duo-btn-outline text-[10px] px-2.5 py-1"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
                                        <div className={`icon-circle w-7 h-7 flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'icon-circle-blue' : 'icon-circle-green'}`}>
                                            {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                                        </div>
                                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-[var(--duo-blue)] text-white font-semibold rounded-tr-md'
                                            : 'bg-[var(--secondary)] text-foreground rounded-tl-md border-2 border-border'
                                            }`}>
                                            {msg.role === 'assistant' ? (
                                                <div
                                                    className="[&_strong]:font-extrabold [&_li]:text-xs [&_li]:my-0.5 text-sm"
                                                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                                                />
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2.5 animate-slide-up">
                                        <div className="icon-circle icon-circle-green w-7 h-7 flex-shrink-0">
                                            <Bot className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="bg-[var(--secondary)] border-2 border-border px-4 py-3 rounded-2xl rounded-tl-md">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t-2 border-border bg-card">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about stocks..."
                            disabled={isLoading}
                            className="flex-1 bg-[var(--secondary)] border-2 border-border border-b-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--duo-blue)] transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--duo-green)] border-2 border-[var(--duo-green-dark)] border-b-4 text-white hover:brightness-110 active:translate-y-[2px] active:border-b-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
