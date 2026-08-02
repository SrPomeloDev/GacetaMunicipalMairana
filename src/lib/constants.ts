export const SITE_NAME = 'Gaceta Municipal de Mairana'
export const SITE_DESCRIPTION = 'Gaceta Oficial del Gobierno Autónomo Municipal de Mairana - Provincia Florida, Santa Cruz, Bolivia'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const DEV_CREDIT = {
  visible: true,
  nombre: 'Pablo Salomón Moya Peña',
  rol: 'Desarrollador',
  ci: '13727173',
}

export const MAIRANA = {
  nombre: 'Mairana',
  provincia: 'Florida',
  departamento: 'Santa Cruz',
  pais: 'Bolivia',
  fundacion: '24 de septiembre de 1875',
  creacion: '12 de mayo de 1938',
  poblacion: '12,735 habitantes',
  clima: '19°C',
  gentilicio: 'Mairaneño/a',
  alcalde: 'Andres Fidel Rocha Rosales',
  capital: 'Capital Tabacalera de Bolivia',
  distancia: '137 km de Santa Cruz de la Sierra',
  direccion: 'Plaza Principal 24 de Septiembre Nº 28',
  telefono: '948-2041',
  email: 'info@mairana.gob.bo',
}

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/normativa', label: 'Normativa' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/autoridades', label: 'Autoridades' },
  { href: '/transparencia', label: 'Transparencia' },
  { href: '/tramites', label: 'Trámites' },
  { href: '/galeria', label: 'Galería' },
  { href: '/contacto', label: 'Contacto' },
]

export const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Panel de Control', icon: 'LayoutDashboard', modulo: 'configuracion' as const },
  { href: '/admin/normativa', label: 'Normativa', icon: 'FileText', modulo: 'normativa' as const },
  { href: '/admin/noticias', label: 'Noticias', icon: 'Newspaper', modulo: 'noticias' as const },
  { href: '/admin/autoridades', label: 'Autoridades', icon: 'Users', modulo: 'autoridades' as const },
  { href: '/admin/dependencias', label: 'Dependencias', icon: 'Building2', modulo: 'dependencias' as const },
  { href: '/admin/categorias', label: 'Categorías', icon: 'Tags', modulo: 'categorias' as const },
  { href: '/admin/concejo', label: 'Concejo', icon: 'Landmark', modulo: 'concejo' as const },
  { href: '/admin/transparencia', label: 'Transparencia', icon: 'Shield', modulo: 'transparencia' as const },
  { href: '/admin/tramites', label: 'Trámites', icon: 'ClipboardList', modulo: 'tramites' as const },
  { href: '/admin/galeria', label: 'Galería', icon: 'Image', modulo: 'galeria' as const },
  { href: '/admin/contrataciones', label: 'Contrataciones', icon: 'Gavel', modulo: 'contrataciones' as const },
  { href: '/admin/suscripciones', label: 'Suscripciones', icon: 'Mail', modulo: 'suscripciones' as const },
  { href: '/admin/mensajes', label: 'Mensajes', icon: 'Inbox', modulo: 'mensajes' as const },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'UserCog', modulo: 'usuarios' as const },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'Settings', modulo: 'configuracion' as const },
]
