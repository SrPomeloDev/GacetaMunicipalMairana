import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, style: 'short' | 'long' | 'full' = 'long'): string {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions =
    style === 'short' ? { day: 'numeric', month: 'short', year: 'numeric' } :
    style === 'long' ? { day: 'numeric', month: 'long', year: 'numeric' } :
    { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  return d.toLocaleDateString('es-BO', options)
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export function getEstadoColor(estado: string): string {
  const map: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    derogada: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    modificada: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    suspendida: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    abrogada: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getEstadoLabel(estado: string): string {
  const map: Record<string, string> = {
    vigente: 'Vigente', derogada: 'Derogada', modificada: 'Modificada',
    suspendida: 'Suspendida', abrogada: 'Abrogada',
  }
  return map[estado] || estado
}

export function truncate(text: string, length: number): string {
  return text.length <= length ? text : text.substring(0, length).trimEnd() + '...'
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`
}
