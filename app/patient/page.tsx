import type { Metadata } from 'next'
import { Mic, Send, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export const metadata: Metadata = {
  title: 'Tell Heidi',
  description: 'Tell Heidi about your visit',
}

export default function PatientChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleReset = () => {
    setMessages([])
    setInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col p-4" style={{ backgroundColor: '#F9F4F1' }}>
      {/* Main content area */}
      <div className="mb-4 flex-1 overflow-auto rounded-lg shadow-sm" style={{ backgroundColor: '#FCFAF8' }}>
        {messages.length > 0 && (
          <div className="flex items-center justify-between border-b px-6 py-3">
            <h2 className="text-sm font-medium text-muted-foreground">Chat with Heidi</h2>
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        )}

        <div className={cn("flex flex-col gap-4 p-6", messages.length === 0 ? "min-h-full" : "")}>
          {messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
              <div>
                <Image
                  src="/heidi-logo.jpg"
                  alt="Heidi"
                  width={48}
                  height={48}
                  className="mx-auto mb-2"
                />
                <p className="text-lg font-medium">Tell Heidi</p>
                <p className="text-sm">Start a conversation with Heidi below</p>
                <p className="text-sm">Heidi will pass your medical info on to the team</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Image
                    src="/heidi-logo.jpg"
                    alt="Heidi"
                    width={20}
                    height={20}
                    className="rounded-sm"
                  />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
                style={message.role === 'user' ? { backgroundColor: '#211217', color: 'white' } : {}}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Image
                  src="/heidi-logo.jpg"
                  alt="Heidi"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
              </div>
              <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-lg px-4 py-3 shadow-sm" style={{ backgroundColor: '#FCFAF8' }}>
        <Image
          src="/heidi-logo.jpg"
          alt="Heidi"
          width={20}
          height={20}
          className="rounded-sm"
        />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={messages.length === 0 ? "What has brought you to the hospital today?" : "Type your response..."}
          className="flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          disabled={isLoading}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 rounded-full text-background transition-colors hover:opacity-90"
          style={{ backgroundColor: '#211217' }}
          disabled={isLoading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
