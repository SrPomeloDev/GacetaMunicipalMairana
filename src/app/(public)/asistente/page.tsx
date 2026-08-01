"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Sparkles, MessageCircle, Search } from "lucide-react"

interface Message {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "¿Qué leyes están vigentes?",
  "¿Cómo se tramita una patente?",
  "¿Cuáles son las ordenanzas recientes?",
]

const initialMessages: Message[] = [
  {
    role: "bot",
    content: "¡Hola! Soy el asistente virtual de la Gaceta Municipal de Mairana. ¿En qué puedo ayudarte? Puedes preguntarme sobre leyes, decretos, ordenanzas y más.",
    timestamp: new Date(),
  },
]

const botResponses: Record<string, string> = {
  "¿Qué leyes están vigentes?": "Actualmente se encuentran vigentes más de 120 normativas en el municipio de Mairana. Entre las más recientes destacan: Ley Municipal de Desarrollo Económico (Ley N° 001/2024), Ordenanza de Desarrollo Urbano (Ordenanza N° 045/2024), y la Ley de Fomento al Empleo Juvenil (Ley N° 012/2024). Podés consultar el listado completo en la sección de Normativa.",
  "¿Cómo se tramita una patente?": "Para tramitar una patente municipal en Mairana, seguí estos pasos: 1) Completá el formulario de solicitud. 2) Presentá tu cédula de identidad vigente. 3) Adjuntá el certificado de registro en FUNDEMPRESA. 4) Incluí un croquis de ubicación del negocio. 5) Aboná la tasa municipal correspondiente (Bs. 250). El trámite tiene un plazo estimado de 15 días hábiles. Podés descargar el formulario en la sección de Trámites.",
  "¿Cuáles son las ordenanzas recientes?": "Las ordenanzas municipales más recientes incluyen: Ordenanza de Desarrollo Urbano Sostenible (N° 045/2024), Ordenanza de Protección del Medio Ambiente (N° 032/2024), Ordenanza de Fomento al Turismo (N° 028/2024), y Ordenanza de Regulación de Comercio Informal (N° 015/2024). Todas están disponibles para su consulta en la sección de Normativa.",
}

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addBotMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "bot", content, timestamp: new Date() }])
    setIsTyping(false)
  }

  const handleSend = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isTyping) return

    setMessages((prev) => [...prev, { role: "user", content: messageText, timestamp: new Date() }])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = Object.entries(botResponses).find(([q]) =>
        messageText.toLowerCase().includes(q.toLowerCase().slice(0, 20))
      )
      if (response) {
        addBotMessage(response[1])
      } else {
        addBotMessage(
          "Entiendo tu consulta. Para brindarte información más precisa, te recomiendo visitar la sección de Normativa donde podés buscar por palabras clave, o contactarnos directamente a través del formulario de contacto. ¿Hay algo más en lo que pueda ayudarte?"
        )
      }
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground font-serif">Asistente Virtual</h1>
        <div className="mt-2 h-1 w-20 rounded-full bg-primary" />
        <p className="mt-4 text-muted-foreground">Consultá sobre la normativa municipal</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-lg">
        <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Asistente Gaceta Municipal</p>
            <p className="text-xs text-muted-foreground">Conocé la normativa de Mairana</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6 max-h-[500px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "bot" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "bot"
                    ? "border-l-4 border-primary bg-muted/50 text-foreground rounded-tl-sm"
                    : "border-r-4 border-blue-500 bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border-l-4 border-primary bg-muted/50 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
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
                <Sparkles className="h-3 w-3 text-primary" />
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
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-card text-card-foreground", className)}>{children}</div>
}
