# Gaceta Municipal — AGENTS.md

## Stack
- Next.js 16.2 (App Router, webpack — Turbopack no soportado en win32/x64 sin SWC nativo)
- Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`, sin `tailwind.config`); dark mode con `@custom-variant dark (&:is(.dark *))` en `globals.css`
- Supabase (auth, DB, storage) — TypeScript strict

## Comandos
```bash
npm run dev        # servidor desarrollo (pasa --webpack internamente)
npm run build      # build producción (pasa --webpack internamente)
npm run start      # producción
npm run lint       # ESLint (eslint-config-next core-web-vitals + typescript)
```
- Nunca agregar `--turbopack` a los scripts.
- No hay tests ni script de typecheck. Verificación = `npm run lint` + `npm run build` (usar `npx tsc --noEmit` para chequear tipos manualmente).

## Build quirks (entorno win32)
- `@next/swc-win32-x64-msvc` no disponible (WASM fallback) → build falla sin `--webpack`.
- `typescript.ignoreBuildErrors: true` en `next.config.ts` (evita error WASM "expected usize") → **el build nunca falla por errores de tipo**; revisar tipos manualmente con `npx tsc --noEmit`.
- `next.config.ts`: redirects `/login`→`/admin/login` y `/admin`→`/admin/dashboard`; `images.remotePatterns` solo `**.supabase.co`; `serverActions.bodySizeLimit: 10mb` (uploads).
- Si el build falla por `tw-animate-css`, quitar ese `@import` de `src/styles/globals.css`.
- **Nunca escribir `*/` dentro del texto de un comentario CSS** (p.ej. `bg-*/text-*`): cierra el comentario antes de tiempo y Tailwind v4 descarta silenciosamente los bloques `@theme`/`@theme inline` posteriores → el CSS compilado queda SIN utilidades de tema (`bg-primary`, `text-primary`, `bg-card`, etc.) pero el build pasa. Verificar tras editar `globals.css`: el CSS de `.next/static/css/*.css` debe contener `.bg-primary`/`.text-primary` (findstr trunca líneas largas; usar node/ripgrep con `--no-line-buffer` o regex).
- Directorio de trabajo real: `C:\Users\lenov\Desktop\Gaceta Municipal` (espacio en nombre). En shell usar `C:\Users\lenov\Desktop\GACETA~1`.

## Middleware
- `middleware.ts` (matcher `/admin/:path*`): sin sesión → redirige a `/admin/login?redirect=<path>`; además valida `usuarios.activo` en DB → signOut + `?error=inactive` si está inactivo. `/admin/login` es la única ruta admin pública.

## Supabase
- Proyecto: `sgnrtgujiadwtljobeva` (URL: `https://sgnrtgujiadwtljobeva.supabase.co`)
- 3 clientes en `src/lib/supabase/`:
  - `client.ts` (browser, `createBrowserClient`)
  - `server.ts` (server, async, `createServerClient` con cookies)
  - `admin.ts` (service-role, solo server — `autoRefreshToken: false`, `persistSession: false`)
- Migraciones en `supabase/migrations/` (ejecutar en orden):
  - `00001_core_tables.sql` — 13 tablas + triggers + RLS base
  - `00002_search_and_rls.sql` — full-text search + políticas; define helpers `current_user_role()`, `is_staff()` y `buscar_normativa()`
  - `00003_configuracion.sql` — tabla `configuracion` de una sola fila (id=1) con políticas SELECT público + UPDATE solo admin
  - **NO existe `00004`**: falta política INSERT/UPDATE para staff (admin + editor) en `configuracion`. Ejecutar SQL manual en Supabase SQL Editor.
- `.env.local` (ver `.env.example`): obligatorias `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; opcionales `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_NAME`, `OPENAI_API_KEY`.

## Auth users (estado actual)
- `pabloxzad77@gmail.com` — admin (owner)
- `profpbz@gmail.com` / `13727173` — editor, email_confirm=true, metadata `{nombre:"Prof PBZ", rol:"editor"}`, id `290a0877-d627-42d3-ba84-f08f8586aefe`
- `andresfidelrocha@hotmail.com` / `13727173` — admin (Alcalde), id `02ba1b39-9612-4122-b110-fcf96a8f6be8`
- Registro público desactivado: `REGISTRO_HABILITADO = false` en `src/app/admin/login/page.tsx:7` (cambiar a `true` para reactivar).

## Estructura relevante
```
src/
├── app/
│   ├── (public)/        # rutas públicas (normativa, noticias, autoridades, transparencia, tramites, galeria, contacto, asistente) — incluye page.tsx (home)
│   ├── admin/           # panel protegido: login, dashboard, CRUDs por módulo
│   ├── api/             # rutas públicas + CRUDs admin en /api/admin/* + /api/asistente/consulta (chatbot MOCK)
│   ├── auth/callback/   # callback OAuth Supabase
│   └── (sin page.tsx en la raíz: la home vive en (public)/page.tsx para heredar header/footer y el toggle de tema)
├── components/
│   ├── ui/              # componentes base (button, input, data-table, modal, toast, ...)
│   ├── layout/          # header, footer, sidebar-admin, admin-header
│   ├── normativa/       # normativa-card, pdf-viewer, normativa-timeline
│   ├── buscador/        # search-bar (usa la función SQL buscar_normativa)
│   ├── chatbot/         # chat-widget (mock, preparado para RAG)
│   └── noticias|autoridades|admin/
├── hooks/
│   └── use-current-user.ts  # hook para obtener perfil real del usuario autenticado
├── lib/
│   ├── utils.ts         # cn()
│   ├── constants.ts     # SITE_URL, datos Mairana, NAV_LINKS / ADMIN_NAV
│   └── supabase/        # 3 clientes (client.ts, server.ts, admin.ts)
├── types/               # index.ts + database.ts (tipos Database MANUALES, a menudo desactualizados)
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
- Assets locales: `escudo-mairana.jpg` (vertical 384x479 → `object-contain` + fondo blanco), `mairana-bandera.svg`, `plaza.jpg`, `AlcaldeMairana.png`

## Despliegue
- GitHub: `https://github.com/SrPomeloDev/GacetaMunicipalMairana.git` (rama `main`, auto-deploy en Vercel)
- Vercel: requiere 3 env vars en Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Datos de Mairana
- Fundación: 24-sep-1875 | Alcalde: Andres Fidel Rocha Rosales | "Capital Tabacalera de Bolivia"
- Población: 12,735 | 137 km de Santa Cruz | Temp: 19°C | Provincia Florida | AMDECRUZ: Región Valles