'use client'

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

export default function DoctorChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPatientSubmitted, setIsPatientSubmitted] = useState(false)
  const [patientData, setPatientData] = useState({
    fullName: '',
    dateOfBirth: '',
    nhsId: '',
  })
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
    setIsPatientSubmitted(false)
  }

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPatientSubmitted(true)
    setIsLoading(true)

    try {
      const response = await fetch('/api/doctor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nhsId: patientData.nhsId,
          fullName: patientData.fullName,
          dateOfBirth: patientData.dateOfBirth,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages([{ role: 'assistant', content: data.message }])
      } else {
        setMessages([
          { role: 'assistant', content: 'Sorry, I encountered an error retrieving patient data. Please try again.' },
        ])
      }
    } catch (error) {
      console.error('Patient data API error:', error)
      setMessages([
        { role: 'assistant', content: 'Sorry, I encountered an error retrieving patient data. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
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
          patientData: patientData,
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
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Patient Data Card - Full height */}
        <div className="w-80 shrink-0 overflow-auto rounded-lg p-6 shadow-sm" style={{ backgroundColor: '#FCFAF8' }}>
          <h2 className="mb-6 text-lg font-semibold" style={{ color: '#211217' }}>
            Patient Information
          </h2>
          <form onSubmit={handlePatientSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                id="fullName"
                value={patientData.fullName}
                onChange={(e) => setPatientData({ ...patientData, fullName: e.target.value })}
                placeholder="Enter patient's full name"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                type="date"
                value={patientData.dateOfBirth}
                onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="nhsId" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                NHS ID
              </label>
              <Input
                id="nhsId"
                value={patientData.nhsId}
                onChange={(e) => setPatientData({ ...patientData, nhsId: e.target.value })}
                placeholder="Enter patient's NHS ID"
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="mt-2 w-full text-white"
              style={{ backgroundColor: '#211217' }}
              disabled={!patientData.fullName || !patientData.dateOfBirth || !patientData.nhsId}
            >
              Submit
            </Button>
          </form>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Chat Card */}
          <div className="flex flex-1 flex-col overflow-auto rounded-lg shadow-sm" style={{ backgroundColor: '#FCFAF8' }}>
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
                    <p className="text-lg font-medium">Ask Heidi</p>
                    <p className="text-sm">Enter the patient details on the left</p>
                    <p className="text-sm">for Heidi to provide their initial differentials</p>
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

          {/* Input bar - Now part of chat section */}
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
              placeholder="Ask Heidi about the results, or enter physical examination data"
              className="flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
              disabled={isLoading || !isPatientSubmitted}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              disabled={isLoading || !isPatientSubmitted}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 rounded-full text-background transition-colors hover:opacity-90"
              style={{ backgroundColor: '#211217' }}
              disabled={isLoading || !input.trim() || !isPatientSubmitted}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
