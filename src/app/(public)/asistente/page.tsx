"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/layout/page-header"
import { IconBox } from "@/components/ui/icon-box"
import { Send, Bot, User, MessageCircle, Search, ExternalLink } from "@/lib/icons"

interface Message {
  role: "user" | "bot"
  content: string
  references?: { titulo: string; url: string }[]
  timestamp: Date
}

const suggestedQuestions = [
  "¿Qué leyes están vigentes?",
  "¿Cómo se tramita una patente?",
  "¿Qué normativa existe sobre transparencia?",
]

const initialMessages: Message[] = [
  {
    role: "bot",
    content: "Hola. Puedo orientarte sobre la Gaceta Municipal de Mairana: leyes, decretos, ordenanzas, trámites y transparencia. Escribí tu consulta o elegí una de las sugerencias.",
    timestamp: new Date(),
  },
]

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const addBotMessage = (content: string, references?: { titulo: string; url: string }[]) => {
    setMessages((prev) => [...prev, { role: "bot", content, references, timestamp: new Date() }])
    setIsTyping(false)
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isTyping) return

    setMessages((prev) => [...prev, { role: "user", content: messageText, timestamp: new Date() }])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/asistente/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: messageText }),
      })
      const data = await res.json()
      if (!res.ok || !data.respuesta) {
        addBotMessage(
          "Lo siento, no pude procesar tu consulta en este momento. Intenta nuevamente o visita la sección de Normativa."
        )
        return
      }
      addBotMessage(data.respuesta, data.referencias)
    } catch {
      addBotMessage(
        "Lo siento, no pude procesar tu consulta en este momento. Intenta nuevamente o visita la sección de Normativa."
      )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pb-16">
      <PageHeader
        title="Asistente Virtual"
        description="Consulta guiada sobre leyes, decretos, ordenanzas y trámites municipales de Mairana."
        crumbs={[{ label: "Asistente" }]}
        icon={<MessageCircle className="hidden h-8 w-8 text-primary sm:block" />}
      >
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-2 backdrop-blur">
          <span className="text-xs font-medium text-muted-foreground">Orientación sobre normativa y trámites</span>
        </div>
      </PageHeader>

      <div className="mx-auto flex max-w-4xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="pt-8">

      <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-lg">
        <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
          <IconBox size="md" shape="full">
            <Bot className="h-5 w-5" />
          </IconBox>
          <div>
            <p className="font-semibold text-foreground">Consulta de la Gaceta Municipal</p>
            <p className="text-xs text-muted-foreground">Leyes, decretos, ordenanzas y trámites</p>
          </div>
        </div>

        <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto p-6 max-h-[500px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "bot" && (
                <IconBox size="sm" shape="full">
                  <Bot className="h-4 w-4" />
                </IconBox>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "bot"
                    ? "border-l-4 border-primary bg-muted/50 text-foreground rounded-tl-sm"
                    : "border-r-4 border-primary-foreground/40 bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {msg.content}
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t pt-2.5">
                    {msg.references.map((ref, j) => (
                      <a
                        key={j}
                        href={ref.url}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {ref.titulo}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <IconBox size="sm" shape="full">
                  <User className="h-4 w-4" />
                </IconBox>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <IconBox size="sm" shape="full">
                <Bot className="h-4 w-4" />
              </IconBox>
              <div className="rounded-2xl rounded-tl-sm border-l-4 border-primary bg-muted/50 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isTyping}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <Search className="h-3 w-3 text-primary" />
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Escribí tu consulta sobre normativa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              />
            </div>
            <Button size="icon" className="h-11 w-11 shrink-0 rounded-xl" onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
      </div>
      </div>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-card text-card-foreground", className)}>{children}</div>
}
