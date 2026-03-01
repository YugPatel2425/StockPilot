'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle2, Lock, ChevronRight, Trophy, Star, Lightbulb, BarChart3, ShieldCheck, Calculator, PieChart, TrendingUp } from 'lucide-react'

interface Lesson {
    id: string
    title: string
    description: string
    icon: React.ElementType
    color: string
    topics: { title: string; content: string }[]
}

const MODULES: Lesson[] = [
    {
        id: 'basics',
        title: 'Stock Market Basics',
        description: 'What are stocks, exchanges, and how trading works',
        icon: BookOpen,
        color: 'green',
        topics: [
            { title: 'What is a Stock?', content: 'A stock represents ownership in a company. When you buy a stock, you own a tiny piece of that company. Companies sell stocks to raise money for growth.\n\n**Key Points:**\n- Stocks are also called shares or equity\n- Stock price goes up when more people want to buy\n- Stock price goes down when more people want to sell\n- You can earn money through price appreciation or dividends' },
            { title: 'Stock Exchanges in India', content: 'India has two major stock exchanges:\n\n**NSE (National Stock Exchange)**\n- Largest exchange in India\n- Uses NIFTY 50 as benchmark index\n- Trades about 90% of India\'s equity volume\n\n**BSE (Bombay Stock Exchange)**\n- Oldest exchange in Asia (est. 1875)\n- Uses SENSEX as benchmark index\n- Lists over 5,000 companies\n\nTrading hours: 9:15 AM to 3:30 PM IST, Monday to Friday' },
            { title: 'How to Place a Trade', content: 'To buy stocks in India, you need:\n\n1. **Demat Account** — holds your stocks digitally\n2. **Trading Account** — lets you place buy/sell orders\n3. **Bank Account** — linked for money transfers\n\n**Order Types:**\n- **Market Order** — buy/sell at current price instantly\n- **Limit Order** — buy/sell only at your specified price\n- **Stop Loss** — automatically sell if price drops to a level\n\nIn StockPilot, we simulate this with virtual ₹10,00,000!' },
        ],
    },
    {
        id: 'reading-charts',
        title: 'Reading Stock Charts',
        description: 'Understand candlestick patterns and chart indicators',
        icon: BarChart3,
        color: 'blue',
        topics: [
            { title: 'Candlestick Charts', content: 'Candlestick charts show four prices for each time period:\n\n- **Open** — price at the start\n- **High** — highest price reached\n- **Low** — lowest price reached\n- **Close** — price at the end\n\n**Green candle** = Close > Open (bullish, price went up)\n**Red candle** = Close < Open (bearish, price went down)\n\nThe thin line (wick) shows the high-low range, while the thick body shows the open-close range.' },
            { title: 'Support & Resistance', content: '**Support** is a price level where a stock tends to stop falling and bounce back up — like a floor.\n\n**Resistance** is a price level where a stock tends to stop rising and pull back — like a ceiling.\n\n**Tips:**\n- Buy near support levels\n- Be cautious near resistance levels\n- When support breaks, it often becomes new resistance\n- When resistance breaks, it often becomes new support\n\nThese levels are not exact — they\'re zones!' },
            { title: 'Volume Analysis', content: 'Volume tells you how many shares were traded. It confirms price movements.\n\n**High volume + rising price** = strong uptrend ✅\n**High volume + falling price** = strong downtrend ⚠️\n**Low volume + any direction** = weak move, may reverse\n\n**Tips:**\n- Look for volume spikes — they indicate important events\n- Average daily volume helps compare stocks\n- Volume in Cr (crores) is common for Indian stocks' },
        ],
    },
    {
        id: 'fundamental-analysis',
        title: 'Fundamental Analysis',
        description: 'Evaluate company health using financial metrics',
        icon: Calculator,
        color: 'orange',
        topics: [
            { title: 'P/E Ratio', content: 'The **Price-to-Earnings (P/E) ratio** tells you how much investors pay for each ₹1 of company earnings.\n\n**Formula:** P/E = Stock Price ÷ Earnings Per Share (EPS)\n\n**Example:** If a stock is ₹500 and EPS is ₹25, P/E = 20\n\n**What it means:**\n- Low P/E (< 15) — may be undervalued or company is struggling\n- Average P/E (15-25) — fairly valued\n- High P/E (> 25) — may be overvalued or high growth expected\n\nAlways compare P/E within the same industry!' },
            { title: 'Market Cap', content: 'Market Capitalization = Stock Price × Total Shares Outstanding\n\nIt tells you the total value of a company in the stock market.\n\n**Indian Market Categories:**\n- 🟢 **Large Cap** (>₹20,000 Cr) — stable, lower risk (TCS, Reliance)\n- 🔵 **Mid Cap** (₹5,000–20,000 Cr) — moderate growth & risk\n- 🟠 **Small Cap** (<₹5,000 Cr) — high growth potential & risk\n\nBeginners should start with large cap stocks!' },
            { title: 'Dividends', content: '**Dividends** are profits that a company shares with its shareholders.\n\n**Dividend Yield** = Annual Dividend ÷ Stock Price × 100\n\n**Example:** If a ₹100 stock pays ₹5 dividend yearly, yield = 5%\n\n**Types:**\n- **Cash dividend** — direct money to your account\n- **Stock dividend** — additional shares instead of cash\n\n**Good dividend stocks in India:** ITC, Coal India, ONGC\n\nDividends provide passive income even if stock price doesn\'t move!' },
        ],
    },
    {
        id: 'risk-management',
        title: 'Risk Management',
        description: 'Protect your capital with smart strategies',
        icon: ShieldCheck,
        color: 'red',
        topics: [
            { title: 'Diversification', content: 'Don\'t put all your eggs in one basket!\n\n**Diversification** means spreading investments across:\n- Different sectors (IT, Banking, Pharma, FMCG)\n- Different market caps (Large, Mid, Small)\n- Different asset types (Stocks, Bonds, Gold)\n\n**Simple Rule for Beginners:**\n- Hold 8-15 stocks from at least 4-5 sectors\n- No single stock should be >15% of your portfolio\n- Start with 70% large cap, 20% mid cap, 10% small cap' },
            { title: 'Stop Loss Strategy', content: 'A **stop loss** automatically sells your stock if it drops to a certain price, limiting your loss.\n\n**The 2% Rule:** Never risk more than 2% of your total capital on a single trade.\n\n**Example:** If you have ₹1,00,000:\n- Max risk per trade = ₹2,000\n- If stock is ₹100, buy 100 shares maximum\n- Set stop loss at ₹80 (₹20 loss × 100 shares = ₹2,000)\n\n**Tips:**\n- Always set a stop loss before entering a trade\n- Don\'t move your stop loss further down\n- Position sizing is just as important as stock picking' },
            { title: 'Common Mistakes', content: '**Avoid these beginner mistakes:**\n\n1. 🚫 **FOMO buying** — buying because everyone else is\n2. 🚫 **Averaging down blindly** — buying more of a falling stock without analysis\n3. 🚫 **No stop loss** — letting losses run hoping for recovery\n4. 🚫 **Over-trading** — too many trades eats into profits via brokerage\n5. 🚫 **Ignoring fees** — brokerage + STT + GST add up\n6. 🚫 **Following tips blindly** — always do your own research\n7. 🚫 **Emotional trading** — fear and greed are your worst enemies\n\n**Golden Rule:** Only invest money you can afford to lose!' },
        ],
    },
    {
        id: 'portfolio-building',
        title: 'Building Your Portfolio',
        description: 'Create a balanced investment strategy',
        icon: PieChart,
        color: 'purple',
        topics: [
            { title: 'Asset Allocation', content: '**Asset Allocation** decides how to split your money across different investment types.\n\n**Simple Formula:** Your stock allocation = 100 - Your Age\n- Age 25 → 75% stocks, 25% bonds/FD\n- Age 40 → 60% stocks, 40% bonds/FD\n\n**Within Stocks:**\n- 50-60% in Index Funds/ETFs (Nifty 50, Nifty Next 50)\n- 20-30% in individual quality stocks\n- 10-20% in high-growth picks\n\nRebalance once a year to maintain your target allocation.' },
            { title: 'SIP vs Lump Sum', content: '**SIP (Systematic Investment Plan)** means investing a fixed amount regularly.\n\n**Benefits of SIP:**\n- ✅ Rupee cost averaging (buy more when cheap, less when expensive)\n- ✅ No need to time the market\n- ✅ Builds discipline\n- ✅ Start with just ₹500/month\n\n**Lump Sum** works better when market is low.\n\n**The verdict:** For beginners, SIP is almost always better. Even ₹5,000/month in a Nifty 50 index fund has historically given 12-15% annual returns over 10+ years!' },
            { title: 'When to Sell', content: '**Knowing when to sell is as important as knowing when to buy!**\n\n**Good reasons to sell:**\n- ✅ Stock reached your target price\n- ✅ Fundamentals have deteriorated\n- ✅ Better opportunity elsewhere\n- ✅ You need to rebalance your portfolio\n\n**Bad reasons to sell:**\n- ❌ Short-term price drops (if fundamentals are fine)\n- ❌ Panic during market corrections\n- ❌ Someone on social media said so\n\n**Rule of thumb:** Review holdings quarterly, but don\'t check prices daily — it leads to emotional decisions!' },
        ],
    },
]

export default function LearnPage() {
    const [completed, setCompleted] = useState<Record<string, boolean>>({})
    const [activeLesson, setActiveLesson] = useState<{ moduleId: string; topicIndex: number } | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem('stockpilot-learn-progress')
        if (saved) setCompleted(JSON.parse(saved))
    }, [])

    const markComplete = (key: string) => {
        const updated = { ...completed, [key]: true }
        setCompleted(updated)
        localStorage.setItem('stockpilot-learn-progress', JSON.stringify(updated))
    }

    const totalTopics = MODULES.reduce((sum, m) => sum + m.topics.length, 0)
    const completedCount = Object.keys(completed).filter(k => completed[k]).length
    const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0

    const activeTopic = activeLesson
        ? MODULES.find(m => m.id === activeLesson.moduleId)?.topics[activeLesson.topicIndex]
        : null

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between animate-bounce-in">
                <div className="flex items-center gap-3">
                    <div className="icon-circle icon-circle-green w-12 h-12">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Learn Trading</h1>
                        <p className="text-sm text-muted-foreground font-medium">{completedCount}/{totalTopics} lessons complete</p>
                    </div>
                </div>
                <div className="duo-badge duo-badge-green text-sm">
                    <Trophy className="h-4 w-4" /> {percent}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="duo-card p-4 animate-slide-up">
                <div className="xp-bar">
                    <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
                </div>
            </div>

            {/* Active Topic View */}
            {activeLesson && activeTopic ? (
                <div className="duo-card p-6 animate-bounce-in">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setActiveLesson(null)} className="duo-btn duo-btn-outline text-xs">
                            ← Back to Modules
                        </button>
                        <span className="text-xs font-bold text-muted-foreground">
                            Topic {activeLesson.topicIndex + 1} of {MODULES.find(m => m.id === activeLesson.moduleId)?.topics.length}
                        </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-foreground mb-4">{activeTopic.title}</h2>
                    <div className="prose prose-sm max-w-none">
                        {activeTopic.content.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return <h3 key={i} className="text-base font-extrabold text-foreground mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>
                            }
                            if (line.startsWith('- ')) {
                                const formatted = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                return <li key={i} className="text-sm text-foreground ml-4 my-1 list-disc" dangerouslySetInnerHTML={{ __html: formatted }} />
                            }
                            if (line.match(/^\d+\./)) {
                                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                return <li key={i} className="text-sm text-foreground ml-4 my-1 list-decimal" dangerouslySetInnerHTML={{ __html: formatted }} />
                            }
                            if (!line.trim()) return <br key={i} />
                            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            return <p key={i} className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-border">
                        {activeLesson.topicIndex > 0 && (
                            <button
                                onClick={() => setActiveLesson({ ...activeLesson, topicIndex: activeLesson.topicIndex - 1 })}
                                className="duo-btn duo-btn-outline text-sm"
                            >
                                ← Previous
                            </button>
                        )}
                        <div className="flex-1" />
                        {completed[`${activeLesson.moduleId}-${activeLesson.topicIndex}`] ? (
                            <span className="duo-badge duo-badge-green text-sm"><CheckCircle2 className="h-4 w-4" /> Completed</span>
                        ) : (
                            <button
                                onClick={() => {
                                    markComplete(`${activeLesson.moduleId}-${activeLesson.topicIndex}`)
                                    const mod = MODULES.find(m => m.id === activeLesson.moduleId)
                                    if (mod && activeLesson.topicIndex < mod.topics.length - 1) {
                                        setActiveLesson({ ...activeLesson, topicIndex: activeLesson.topicIndex + 1 })
                                    }
                                }}
                                className="duo-btn duo-btn-green text-sm"
                            >
                                {(() => {
                                    const mod = MODULES.find(m => m.id === activeLesson.moduleId)
                                    return activeLesson.topicIndex < (mod?.topics.length || 1) - 1 ? 'Complete & Next →' : 'Complete Lesson ✓'
                                })()}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* Module Cards */
                <div className="flex flex-col gap-4 stagger">
                    {MODULES.map((mod, mi) => {
                        const modCompleted = mod.topics.filter((_, ti) => completed[`${mod.id}-${ti}`]).length
                        const modPercent = Math.round((modCompleted / mod.topics.length) * 100)
                        const allDone = modCompleted === mod.topics.length
                        const Icon = mod.icon
                        return (
                            <div key={mod.id} className={`duo-card duo-card-${mod.color} p-5 animate-slide-up`} style={{ animationDelay: `${mi * 0.08}s` }}>
                                <div className="flex items-center gap-4">
                                    <div className={`icon-circle icon-circle-${mod.color} w-12 h-12 ${allDone ? '' : ''}`}>
                                        {allDone ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-extrabold text-foreground">{mod.title}</h3>
                                            {allDone && <span className="duo-badge duo-badge-green text-[10px]">Complete!</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{mod.description}</p>
                                        <div className="xp-bar mt-2.5 h-2">
                                            <div className="xp-bar-fill" style={{ width: `${modPercent}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{modCompleted}/{mod.topics.length}</span>
                                </div>
                                <div className="flex flex-col gap-1.5 mt-4 pl-16">
                                    {mod.topics.map((topic, ti) => {
                                        const done = completed[`${mod.id}-${ti}`]
                                        return (
                                            <button
                                                key={ti}
                                                onClick={() => setActiveLesson({ moduleId: mod.id, topicIndex: ti })}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all hover:bg-[var(--secondary)] active:scale-[0.98] ${done ? 'opacity-80' : ''}`}
                                            >
                                                {done ? (
                                                    <CheckCircle2 className="h-4 w-4 text-[var(--duo-green)] flex-shrink-0" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                                                )}
                                                <span className={`text-sm font-semibold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                    {topic.title}
                                                </span>
                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
