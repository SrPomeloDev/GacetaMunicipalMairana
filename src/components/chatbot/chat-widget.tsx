"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, X, Bot, User, Sparkles, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "bot"
  content: string
}

const suggestedQuestions = [
  "¿Cómo solicito un trámite?",
  "¿Cuáles son las ordenanzas vigentes?",
  "¿Cómo contactar al concejo?",
  "¿Dónde está la alcaldía?",
]

const sampleResponses: Record<string, string> = {
  "¿cómo solicito un trámite?": "Puede acercarse a la Ventanilla Única de la Alcaldía Municipal de Mairana en horario de atención de 08:00 a 16:00. También puede consultar la sección Trámites en nuestro portal web para ver los requisitos en formato digital.",
  "¿cuáles son las ordenanzas vigentes?": "Puede consultar todas las ordenanzas y leyes autonómicas vigentes en la sección Normativa del portal de la Gaceta. Utilice los filtros por tipo de norma y estado jurídico para una búsqueda inmediata.",
  "¿cómo contactar al concejo?": "Puede contactar al Honorable Concejo Municipal de Mairana a través del teléfono (948-2041) o visitar las oficinas legislativas en la Plaza Principal N° 28.",
  "¿dónde está la alcaldía?": "La Alcaldía Municipal de Mairana está ubicada en la Plaza Principal 24 de Septiembre Nº 28. Atendemos de Lunes a Viernes de 08:00 a 16:00.",
}

const welcomeMessage: Message = {
  role: "bot",
  content:
    "¡Hola! Soy el asistente virtual de la Gaceta Municipal de Mairana. Puedo ayudarte a encontrar información sobre Leyes Autonómicas, Ordenanzas, Trámites y Servicios del Municipio.",
}

interface ChatWidgetProps {
  fullPage?: boolean
}

export function ChatWidget({ fullPage }: ChatWidgetProps) {
  const [open, setOpen] = useState(fullPage || false)
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addBotMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "bot", content }])
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
    const lower = text.toLowerCase()
    const keys = Object.keys(sampleResponses)
    const found = keys.find((k) => lower.includes(k.replace(/[¿?]/g, "")))
    const reply = found
      ? sampleResponses[found]
      : "Gracias por su consulta. Para información específica sobre expedientes o leyes particulares, por favor comuníquese a la Alcaldía Municipal o revise el módulo de Normativa en esta Gaceta."
    addBotMessage(reply)
    setLoading(false)
  }

  const handleSuggested = (q: string) => {
    setInput(q)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const messagesContainer = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2.5",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "bot" && (
              <div className="flex-shrink-0 h-7 w-7 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xs mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs border",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground border-orange-500/30 rounded-tr-xs font-medium"
                  : "bg-muted/80 text-foreground border-border/60 rounded-tl-xs"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 h-7 w-7 rounded-xl bg-slate-800 text-white flex items-center justify-center mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="flex-shrink-0 h-7 w-7 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-xs px-4 py-2.5 flex items-center gap-1.5 border">
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-muted/30 space-y-2">
        <div className="flex flex-wrap gap-1">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSuggested(q)}
              className="text-[10px] font-semibold bg-background hover:bg-primary/10 text-muted-foreground hover:text-primary px-2.5 py-1 rounded-full border border-border/60 transition-colors"
            >
              <Sparkles className="h-2.5 w-2.5 inline mr-1 text-primary" />
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba su consulta..."
            className="flex-1 text-xs h-9"
          />
          <Button size="sm" className="h-9 px-3 font-bold" onClick={handleSend} disabled={!input.trim() || loading}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  )

  if (fullPage) {
    return (
      <div className="flex flex-col h-full bg-card rounded-2xl border shadow-md overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <Sparkles className="h-5 w-5" />
          <div>
            <p className="font-bold text-sm font-serif">Asistente Municipal IA</p>
            <p className="text-[10px] text-orange-100">Consultas de Gaceta y Trámites Mairana</p>
          </div>
        </div>
        {messagesContainer}
      </div>
    )
  }

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 text-white hover:scale-105 transition-all duration-300"
          aria-label="Abrir asistente de la Gaceta"
        >
          <Sparkles className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background" />
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-6 w-84 sm:w-96 h-[460px] bg-card rounded-3xl border border-primary/20 shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600 text-white">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-xs font-serif leading-tight">Asistente Virtual IA</p>
            <p className="text-[10px] text-orange-100 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              En línea • G.A.M. Mairana
            </p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      {messagesContainer}
    </div>
  )
}

