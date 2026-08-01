export const SITE_NAME = 'Gaceta Municipal de Mairana'
export const SITE_DESCRIPTION = 'Gaceta Oficial del Gobierno Autónomo Municipal de Mairana - Provincia Florida, Santa Cruz, Bolivia'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
  { href: '/admin/dashboard', label: 'Panel de Control', icon: 'LayoutDashboard' },
  { href: '/admin/normativa', label: 'Normativa', icon: 'FileText' },
  { href: '/admin/noticias', label: 'Noticias', icon: 'Newspaper' },
  { href: '/admin/autoridades', label: 'Autoridades', icon: 'Users' },
  { href: '/admin/transparencia', label: 'Transparencia', icon: 'Shield' },
  { href: '/admin/tramites', label: 'Trámites', icon: 'ClipboardList' },
  { href: '/admin/galeria', label: 'Galería', icon: 'Image' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'UserCog' },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'Settings' },
]
