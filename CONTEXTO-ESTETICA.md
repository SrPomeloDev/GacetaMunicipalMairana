# CONTEXTO-ESTETICA — Gaceta Municipal de Mairana

> Documento para que una IA comprenda rápido el proyecto y edite **SOLO estética** (layout, estilos, responsive, textos visuales menores).
> **Prohibido cambiar funcionalidad**: datos, auth, APIs, RLS, migraciones, lógica de negocio.

## 1. Qué es y stack

- Portal institucional + Gaceta Oficial del Gobierno Autónomo Municipal de Mairana (Bolivia).
- **Next.js 16.2** (App Router, webpack), **Tailwind CSS v4** vía PostCSS (sin `tailwind.config`), **Supabase** (auth/DB/storage), TypeScript strict, `next/image`, lucide-react.
- Alias `@/` → `src/`. Server Components por defecto; `"use client"` solo con hooks/interactividad.

## 2. Comandos y quirks de build

```bash
npm run dev     # desarrollo (usa --webpack internamente)
npm run build   # producción (usa --webpack internamente)
npm run lint    # ESLint (0 errores / 0 warnings actualmente)
```

- Nunca agregar `--turbopack`. No hay tests unitarios; suite E2E en `e2e/` (Playwright, proyecto propio).
- `typescript.ignoreBuildErrors: true` en `next.config.ts` → **el build nunca falla por tipos**; verificar manualmente con `npx tsc --noEmit` (actualmente 0 errores).
- `next.config.ts`: redirects `/login`→`/admin/login`, `/admin`→`/admin/dashboard`, `/normativa`→`/gaceta`; `images.remotePatterns` solo `**.supabase.co`; `serverActions.bodySizeLimit: 10mb`.
- Tras editar `globals.css`, verificar que el CSS compilado (`.next/static/css/*.css`) contenga `.bg-primary` / `.text-primary-foreground`.

## 3. Sistema de diseño (`src/styles/globals.css`)

- Primario `#EA580C` (naranja institucional). Variables CSS en `:root` (light) y `.dark` (dark): `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, `--sidebar-*`, `--estado-*`, etc.
- Utilidades Tailwind generadas vía `@theme inline` (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, …).
- Sombras: `shadow-card`, `shadow-lifted`, `shadow-glow`. Utilidades: `.glass-bar` (header sticky), `.heading-kicker`, `.bg-pattern-dots/grid`, `.liquid-glass`.
- Fuentes: Inter (`--font-sans`) y Merriweather (`--font-serif`, títulos con `font-serif`).

### Modo oscuro (class-based)

- Se activa con la clase `dark` en `<html>` (NO `prefers-color-scheme`): `@custom-variant dark (&:is(.dark *))`.
- `ThemeProvider` (`src/components/theme-provider.tsx`): `toggleTheme`/`setTheme`, persiste en `localStorage` (`gaceta-theme`), sincroniza con `auth.users` metadata `tema`; script anti-flash en `src/app/layout.tsx`.
- Botones: sol/luna en header público y `admin-header`; selector en `/admin/perfil`.

## 4. Reglas duras de estética (lo que rompe si se ignora)

1. **Contraste**: chips, badges y cajas de icono siempre con fondo sólido `bg-primary text-primary-foreground` (o `bg-muted` + icono `text-primary`). NUNCA `bg-primary/10` + texto blanco/primario: invisible en light mode y en Android sin `color-mix()`. Solo `hover:bg-primary/10` sobre botones outline es seguro.
2. **CSS**: nunca escribir `*/` dentro de un comentario CSS (cierra el comentario y Tailwind v4 descarta bloques `@theme` en silencio).
3. **`next/image`**: locales con `width/height`; remotas Supabase con `fill` + `sizes` (+ contenedor `relative`); SVG siempre con `unoptimized` (sin `dangerouslyAllowSVG` el optimizador devuelve 400); data-URLs (QR) con `unoptimized`.
4. **Checkbox** (`ui/checkbox.tsx`): el `<Check>` debe ser **hermano directo** del input para que `peer-checked:` funcione; es un input nativo (`onChange`/`checked`, NO `onCheckedChange`).
5. **Responsive**: tablas con `min-w-[640px]` dentro de contenedor `overflow-auto`; modales/menú móvil/toasts con `max-h` + `overflow-y-auto`; fuente mínima `text-xs`; targets táctiles ≥36px (`icon-sm` = `h-9 w-9`).
6. **Header fijo**: `main` usa `pt-16 sm:pt-[100px] xl:pt-[104px]`; el héroe del home usa `lg:pt-16` (no aumentar sin medir la posición del h1).
7. **E2E protegidos**: `/admin/login` debe conservar ids `#email`/`#password`, h1 `Iniciar Sesión` y textos principales.

## 5. Mapa de archivos

```
src/app/(public)/   # home (page.tsx: héroe + servicios + noticias), normativa, noticias, tramites,
                    # transparencia, contrataciones, autoridades, concejo-municipal, organo-ejecutivo,
                    # galeria (con lightbox), contacto, asistente, gaceta + layout con header/footer
src/app/admin/      # login, dashboard, perfil + CRUDs: normativa, noticias, autoridades, tramites,
                    # transparencia, galeria, contrataciones, concejo (+comisiones/sesiones),
                    # dependencias, categorias, usuarios, mensajes, suscripciones, configuracion
src/app/api/        # ⛔ NO TOCAR (APIs públicas + /api/admin/* + asistente)
src/components/ui/  # button, input, select, textarea, card, badge, data-table, modal,
                    # toast, checkbox, skeleton, search-input, reveal, confirm-dialog
src/components/layout/ # header, footer, sidebar-admin, admin-header, page-header,
                       # newsletter-form, gaceta-switcher
src/components/admin/  # permisos-editor, file-upload, confirm-dialog
src/components/normativa/ # pdf-viewer (altura h-[60vh] sm:h-[650px]), normativa-card
src/lib/            # constants.ts (MAIRANA, NAV_LINKS, ADMIN_NAV), roles.ts (permisos),
                    # utils.ts (cn, getEstadoColor, formatDate), supabase/ (3 clientes)
src/types/          # ⛔ NO TOCAR (index.ts + database.ts tipados de Supabase)
supabase/migrations/ # ⛔ NO TOCAR (00001–00008)
middleware.ts -> src/middleware.ts  # ⛔ NO TOCAR (matcher /admin/:path*, requiere estar en src/)
public/images/      # escudo-mairana.jpg, mairana-bandera.svg, plaza.jpg, AlcaldeMairana.png,
                    # transparencia-ley341.png, mairana-gam-banner.png, mairana-corazon-valles.png
```

## 6. Marca actual (dónde va cada imagen)

- **Header público**: `mairana-corazon-valles.png` (1405×1037, transparente, `h-12 sm:h-14 w-auto`, sin caja) + texto “Gaceta Municipal”.
- **Héroe del home**: `mairana-gam-banner.png` (1000×295, `h-14 sm:h-20 lg:h-24`) junto a la bandera.
- **Footer / login / sidebar admin / placeholders**: `escudo-mairana.jpg` (conservar).
- **Concejo**: foto grupal desde Supabase Storage (`noticias-imagenes/concejo/foto-grupal.jpeg`), NO archivo local.

## 7. Patrones vigentes (seguir, no reinventar)
- Acciones de tabla: iconos `Pencil` (editar, outline) / `Trash2` (eliminar, ghost destructive) con `aria-label`, en `flex gap-1`; “Nuevo X” siempre con icono `Plus`.
- Toggles de estado (Publicada/Destacada/Activo): botones, NO badges; con estado `disabled` durante el PATCH.
- Formularios admin: barra sticky abajo-derecha (`sticky bottom-0 … bg-background/95 backdrop-blur border-t`) con Cancelar (outline) + Guardar; un solo botón Volver (`ArrowLeft`, ghost) arriba.
- Buscador de listados: componente `SearchInput`; listados con `DataTable` dentro de `Card`.
- Badges de estado: variantes `Badge` dark-safe (sufijos `dark:`), nunca pills custom sin dark.
- Empty states con CTA; loading con `Skeleton`; dashboard con estado de error + “Reintentar”.
- **Iconos**: escala oficial `xs` h-3.5 (inline) · `sm` h-4 (botones/texto) · `md` h-5 (nav/headers) · `lg` h-6 (destacados) · `xl` h-8+ (héroes/vacíos); excepción: `h-3` solo en inline denso. Cajas de icono SIEMPRE con `IconBox` (`size` sm/md/lg/xl → h-8/h-10/h-12/h-16, `tone` primary/muted/destructive, `shape` rounded/full). Contenido público → `@/lib/icons` (Phosphor duotone, `weight` blindado, no sobrescribir); primitivas UI y panel admin → `lucide-react` directo. Metáforas únicas: documentos `FileText`, gaceta `ScrollText`, noticias `Newspaper`, trámites `ClipboardList`, ver público `ExternalLink`, editar `Pencil`, eliminar `Trash2`, fecha `Calendar`, contacto `Mail/Phone/MapPin`, ley `Scale`/`Gavel`, institución `Landmark`, estado inactivo `XCircle`+`CheckCircle2`. Favicon: `src/app/icon.png` + `apple-icon.png` (auto-generados por Next.js).

## 8. Verificación obligatoria tras cada cambio

```bash
npx tsc --noEmit   # 0 errores
npm run lint       # 0 problemas
npm run build      # compila OK
```

Smoke en dev (`npm run dev`, puerto 3000): home 200, una página pública, `/admin/login` (marcadores E2E), toggle claro/oscuro, viewport 360px + desktop, y la zona tocada sin desbordes.

## 9. Límites de alcance

- ✅ Layout, clases Tailwind, responsive, imágenes/alt, textos cosméticos, iconos, espaciados, dark mode, micro-interacciones CSS.
- ⛔ Fetch/queries Supabase, RLS, auth, rutas API, migraciones, `src/types`, `middleware`, variables de entorno, lógica de formularios (validación/envío), textos cubiertos por E2E.
