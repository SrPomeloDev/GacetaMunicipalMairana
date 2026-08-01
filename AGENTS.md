# Gaceta Municipal — AGENTS.md

## Stack
- Next.js 16.2 (App Router, webpack — Turbopack no soportado en win32/x64 sin SWC nativo)
- Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`, sin `tailwind.config`); dark mode con `@custom-variant dark (&:is(.dark *))` en `globals.css`
- Supabase (auth, DB, storage) — TypeScript strict

## Comandos
```bash
npm run dev        # servidor desarrollo
npm run build      # build producción
npm run start      # producción
npm run lint       # ESLint (eslint-config-next core-web-vitals + typescript)
```
- Los scripts `dev`/`build` ya pasan `--webpack` internamente — nunca agregar `--turbopack`.
- No hay tests ni script de typecheck. Verificación = `npm run lint` + `npm run build` (usar `npx tsc --noEmit` para chequear tipos).

## Build quirks (entorno win32)
- `@next/swc-win32-x64-msvc` no disponible (WASM fallback) → build falla sin `--webpack`.
- `typescript.ignoreBuildErrors: true` en `next.config.ts` (evita error WASM "expected usize") → **el build nunca falla por errores de tipo**; revisar tipos manualmente.
- `next.config.ts` además: redirects `/login`→`/admin/login` y `/admin`→`/admin/dashboard`; `images.remotePatterns` solo `**.supabase.co`; `serverActions.bodySizeLimit: 10mb` (uploads).
- Si el build falla por `tw-animate-css`, quitar ese `@import` de `src/styles/globals.css`.

## Middleware
- `middleware.ts` (matcher `/admin/:path*`): sin sesión → redirige a `/admin/login?redirect=<path>`; además valida `usuarios.activo` en DB → signOut + `?error=inactive` si está inactivo. `/admin/login` es la única ruta admin pública.

## Supabase
- 3 clientes: `client.ts` (browser), `server.ts` (server, async), `admin.ts` (service-role, solo server — `autoRefreshToken: false`).
- Migraciones en `supabase/migrations/` (ejecutar en orden):
  - `00001_core_tables.sql` — 13 tablas + triggers + RLS base
  - `00002_search_and_rls.sql` — full-text search + políticas; define helpers `current_user_role()`, `is_staff()` y `buscar_normativa()` que usan las políticas y la API
  - `00003_configuracion.sql` — tabla `configuracion` de una sola fila (id=1)
- `.env.local` (ver `.env.example`): obligatorias `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; opcionales `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_NAME`, `OPENAI_API_KEY`.

## Estructura
```
src/
├── app/
│   ├── (public)/        # rutas públicas (normativa, noticias, autoridades, transparencia, tramites, galeria, contacto, asistente)
│   ├── admin/           # panel protegido: login, dashboard, CRUDs por módulo
│   ├── api/             # rutas públicas (/api/normativa, /api/noticias, ...) + CRUDs admin en /api/admin/*
│   │                    # + /api/asistente/consulta = chatbot MOCK (matching de keywords, sin LLM ni RAG)
│   ├── auth/callback/   # callback OAuth Supabase
│   └── page.tsx         # home page
├── components/
│   ├── ui/              # componentes base (button, input, data-table, modal, toast, ...)
│   ├── layout/          # header, footer, sidebar-admin, admin-header
│   ├── normativa/       # normativa-card, pdf-viewer, normativa-timeline
│   ├── buscador/        # search-bar (usa la función SQL buscar_normativa)
│   ├── chatbot/         # chat-widget (mock, preparado para RAG)
│   └── noticias|autoridades|admin/
├── lib/
│   ├── utils.ts         # cn()
│   ├── constants.ts     # SITE_URL, datos Mairana, NAV_LINKS / ADMIN_NAV
│   └── supabase/
├── types/               # index.ts + database.ts (tipo Database generado)
└── styles/globals.css
```

## Convenciones de código
- No agregar comentarios a menos que se soliciten
- "use client" solo cuando hay hooks o interactividad; Server Components por defecto
- Clases con Tailwind + CSS variables vía `cn()` (`@/lib/utils`)
- Imports con alias `@/` → `src/`; `displayName` en componentes con `forwardRef`

## Tema institucional
- Primario `#EA580C` (oklch 0.65 0.18 45); variables CSS en `globals.css` para light + `.dark`
- Estados de normativa: vigente/derogada/modificada/suspendida (variables `--estado-*`)

## Datos de Mairana
- Fundación: 24-sep-1875 | Alcalde: Andres Fidel Rocha Rosales | "Capital Tabacalera de Bolivia"
- Población: 12,735 | 137 km de Santa Cruz | Temp: 19°C | Provincia Florida | AMDECRUZ: Región Valles
