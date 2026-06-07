'use client'

import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Sparkles, Send, Loader2, Bot, User } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  model?: string
}

const SUGGESTIONS = [
  'Show me all assets expiring this month',
  'Which devices have low battery health?',
  'How many unassigned assets do I have?',
  'Which software licenses need renewal?',
  'Give me a summary of my entire inventory',
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AssetIQ assistant powered by Xeltr. I can help you search your inventory, find expiring assets, analyse risks, and answer any questions about your assets. What would you like to know?",
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const msg = text ?? input
    if (!msg.trim() || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res  = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(m => [...m, {
        role:    'assistant',
        content: data.reply ?? data.error ?? 'Something went wrong.',
        model:   data.model,
      }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">AI Assistant</h1>
            <p className="text-xs text-gray-500">Powered by OpenAI · auto-detects GPT-3.5 or GPT-4o</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                m.role === 'user'
                  ? 'bg-brand-600'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {m.role === 'user'
                  ? <User size={13} className="text-white" />
                  : <Bot size={13} className="text-gray-500 dark:text-gray-400" />
                }
              </div>
              <div className={`max-w-2xl ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
                {m.model && (
                  <p className="text-[10px] text-gray-400 px-1">
                    {m.model === 'gpt-4o' ? '⚡ GPT-4o' : '💬 GPT-3.5'}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-gray-500" />
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                <Loader2 size={14} className="animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 pb-3 flex gap-2 flex-wrap">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-brand-600 hover:text-brand-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Ask anything about your assets…"
                rows={1}
                className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-800 text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>

      </main>
    </div>
  )
}
