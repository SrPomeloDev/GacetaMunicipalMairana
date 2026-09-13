"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

interface UseDictadoVozOptions {
  lang?: string
  onResult?: (texto: string) => void
  onError?: (mensaje: string) => void
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type RecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort?: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
}

function getRecognitionConstructor(): (new () => RecognitionInstance) | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as Record<string, unknown>
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => RecognitionInstance)
    | undefined
  return Ctor ?? null
}

export function isDictadoSoportado(): boolean {
  return getRecognitionConstructor() !== null
}

function subscribeSoporte() {
  return () => {}
}

function snapshotSoporte() {
  return isDictadoSoportado()
}

function snapshotServidor() {
  return false
}

export function useDictadoSoportado(): boolean {
  return useSyncExternalStore(subscribeSoporte, snapshotSoporte, snapshotServidor)
}

export function useDictadoVoz({ lang = "es-BO", onResult, onError }: UseDictadoVozOptions = {}) {
  const soportado = useDictadoSoportado()
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<RecognitionInstance | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort?.()
      } catch {
      }
    }
  }, [])

  const detener = useCallback(() => {
    try {
      recognitionRef.current?.abort?.()
    } catch {
    }
    setEscuchando(false)
  }, [])

  const iniciar = useCallback(() => {
    if (recognitionRef.current) return
    setError(null)
    const Ctor = getRecognitionConstructor()
    if (!Ctor) {
      const msg = "Tu navegador no soporta dictado por voz. Probá con Chrome o Edge."
      setError(msg)
      onErrorRef.current?.(msg)
      return
    }

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = false

    rec.onresult = (e) => {
      const texto = e.results?.[0]?.[0]?.transcript?.trim() ?? ""
      if (texto) onResultRef.current?.(texto)
      setEscuchando(false)
    }

    rec.onerror = (e) => {
      if (recognitionRef.current !== rec) return
      setEscuchando(false)
      const code = e?.error ?? ""
      if (code === "aborted") return
      const msg =
        code === "not-allowed" || code === "service-not-allowed"
          ? "Permiso de micrófono denegado. Tocá el candado del navegador para permitirlo e intentá de nuevo."
          : code === "no-speech"
            ? "No te escuché. Tocá el micrófono y hablá de nuevo."
            : code === "audio-capture"
              ? "No se encontró micrófono en este dispositivo."
              : code === "network"
                ? "Se necesita internet para dictar por voz. Revisá tu conexión."
                : "No se pudo usar el micrófono. Probá de nuevo."
      setError(msg)
      onErrorRef.current?.(msg)
    }

    rec.onend = () => {
      if (recognitionRef.current !== rec) return
      setEscuchando(false)
      recognitionRef.current = null
    }

    recognitionRef.current = rec
    try {
      rec.start()
      setEscuchando(true)
    } catch {
      setEscuchando(false)
    }
  }, [lang])

  const alternar = useCallback(() => {
    if (escuchando) detener()
    else iniciar()
  }, [escuchando, detener, iniciar])

  return { soportado, escuchando, error, iniciar, detener, alternar }
}
