"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Theme = "light" | "dark"

const STORAGE_KEY = "gaceta-theme"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

// Aplica el cambio de tema en el mismo frame: congela todas las transiciones
// durante el swap para que superficies y controles cambien juntos, sin oleada.
function withThemeTransition(swap: () => void) {
  const root = document.documentElement
  root.classList.add("theme-no-transition")
  void root.offsetHeight
  swap()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-no-transition")
    })
  })
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "dark" || stored === "light" ? stored : "light"
  } catch {
    return "light"
  }
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // almacenamiento bloqueado (modo privado/cookies desactivadas): el tema igual se aplica en memoria
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    return readStoredTheme()
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    withThemeTransition(() => applyTheme(next))
    storeTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      withThemeTransition(() => applyTheme(next))
      storeTheme(next)
      return next
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const loadUserTheme = async () => {
      const { data } = await supabase.auth.getUser()
      const t = data.user?.user_metadata?.tema
      if ((t === "dark" || t === "light") && t !== theme) {
        setThemeState(t)
        applyTheme(t)
        storeTheme(t)
      }
    }
    loadUserTheme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider")
  return ctx
}
