"use client"

import { createContext, useCallback, useContext, useEffect, useReducer, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"

const STORAGE_KEY = "gaceta-modo-senior"
const ADMIN_STORAGE_KEY = "gaceta-modo-senior-admin"
const CLASS_NAME = "modo-senior"

interface AccessibilityContextValue {
  senior: boolean
  setSenior: (v: boolean) => void
  toggleSenior: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined)

function applySenior(v: boolean) {
  document.documentElement.classList.toggle(CLASS_NAME, v)
}

function keyFor(admin: boolean) {
  return admin ? ADMIN_STORAGE_KEY : STORAGE_KEY
}

function storeSenior(admin: boolean, v: boolean) {
  try {
    localStorage.setItem(keyFor(admin), v ? "1" : "0")
  } catch {
  }
}

function readSenior(admin: boolean): boolean {
  try {
    return localStorage.getItem(keyFor(admin)) === "1"
  } catch {
    return false
  }
}

function subscribeSenior(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getSeniorServerSnapshot(): boolean {
  return false
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const admin = pathname?.startsWith("/admin") ?? false

  const getSeniorSnapshot = useCallback(() => readSenior(admin), [admin])
  const senior = useSyncExternalStore(subscribeSenior, getSeniorSnapshot, getSeniorServerSnapshot)
  const [, forceRender] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    applySenior(senior)
  }, [senior])

  const setSenior = useCallback((v: boolean) => {
    applySenior(v)
    storeSenior(admin, v)
    forceRender()
  }, [admin])

  const toggleSenior = useCallback(() => {
    const next = !readSenior(admin)
    applySenior(next)
    storeSenior(admin, next)
    forceRender()
  }, [admin])

  return (
    <AccessibilityContext.Provider value={{ senior, setSenior, toggleSenior }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error("useAccessibility debe usarse dentro de AccessibilityProvider")
  return ctx
}
