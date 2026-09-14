"use client"

import { createContext, useContext } from "react"

type PortalConfig = {
  fondo_url: string | null
}

const PortalConfigContext = createContext<PortalConfig | null>(null)

export function PortalConfigProvider({
  fondoUrl,
  children,
}: {
  fondoUrl: string | null
  children: React.ReactNode
}) {
  return <PortalConfigContext.Provider value={{ fondo_url: fondoUrl }}>{children}</PortalConfigContext.Provider>
}

export function usePortalConfig(): PortalConfig {
  const ctx = useContext(PortalConfigContext)
  return ctx ?? { fondo_url: null }
}