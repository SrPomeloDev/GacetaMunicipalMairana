# Sistema de Diseño — Gaceta Municipal (Next.js 16 + Tailwind CSS v4)

Guía completa de identidad y tokens de diseño del sitio **Gaceta Oficial del Gobierno Autónomo Municipal de Mairana**, para replicar el mismo diseño en otro proyecto.

---

## 1. Stack de diseño

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** (App Router, webpack) |
| CSS | **Tailwind CSS v4** via PostCSS (`@tailwindcss/postcss`, **sin** `tailwind.config`) |
| Tipografía | Google Fonts: **Inter** (sans) + **Merriweather** (serif) |
| Iconos | **lucide-react** |

## 2. Idiomas y modo oscuro

- Tailwind v4 usa `@custom-variant dark (&:is(.dark *))` — el modo oscuro se activa con la clase `.dark` en `<html>`, NO con `prefers-color-scheme`.
- Definir en `globals.css`:
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:is(.dark *));
  ```

## 3. Paleta de color institucional

### Claro (`:root`)
| Variable | Valor HEX | Rol |
|----------|-----------|-----|
| `--background` | `#FCF8F3` | Fondo principal (crema cálido) |
| `--foreground` | `#070C10` | Texto principal (casi negro azulado) |
| `--card` | `#FFFDFB` | Fondo de tarjetas |
| `--popover` | `#FFFDFB` | Popovers / menús |
| `--primary` | **`#E46212`** | **Naranja institucional** (botones, énfasis) |
| `--primary-foreground` | `#FCFCFC` | Texto/icono sobre primary (blanco) |
| `--secondary` | `#F9F5F1` | Fondo secundario |
| `--muted` | `#F9F5F1` | Elementos suavizados |
| `--muted-foreground` | `#585F64` | Texto secundario/gris |
| `--accent` | `#F6F1EC` | Fondo de hover acento |
| `--destructive` | `#E60016` | Rojo de error/borrado |
| `--border` | `#E9E5E1` | Bordes |
| `--input` | `#E9E5E1` | Inputs |
| `--ring` | `#E46212` | Anillo de foco |
| `--chart-1..5` | `#E46212 #00978A #005961 #E2BA00 #FF7D5A` | Colores de gráficas |

### Modo oscuro (`.dark`)
| Patente | HEX |
|---------|-----|
| `--background` | `#100B08` |
| `--foreground` | `#EEEBE5` |
| `--card` | `#1E1712` |
| `--primary` | `#F87025` (naranja más brillante) |
| `--primary-foreground` | `#FEFBFA` |
| `--muted` | `#1E1814` |
| `--muted-foreground` | `#9E978F` |
| `--border` | `#2F2721` |
| `--ring` | `#F87025` |

### Estados de normativa
| Estado | HEX |
|--------|-----|
| Vigente | `#16a34a` (verde) |
| Derpgado | `#dc2626` (rojo) |
| Modificada | `#ca8a04` (ambar) |
| Suspendida | `#f97316` (naranja) |

### Fallbacks `oklch()`
Los valores HEX son el **fallback base**; tras ellos se redefinen los mismos en `oklch()` dentro de `@supports (color: oklch(0 0 0))` para navegadores modernos:

- Light primary: `oklch(0.65 0.18 45)` | Dark primary: `oklch(0.70 0.185 45)`
- Semántica institucional: el naranja es **`#E46212`** en claro y **`#F87025`** en oscuro.

## 4. Configuración Tailwind v4 (mapeo de tokens)

No hay `tailwind.config`. En `globals.css` se usan `@theme inline` para mapear las utilidades `bg-`, `text-`, `border-` a las variables:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-border: var(--border);
  --color-ring: var(--ring);
  /* ...además foreground, secondary, destructive, chart-*, sidebar-*, estado-* */
}
```

Y radios:
```css
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);          /* 0.75rem */
--radius-xl: calc(var(--radius) + 4px);
--radius-2xl: calc(var(--radius) + 8px);
```

Fuentes:
```css
--font-sans: var(--font-inter, system-ui, sans-serif);
--font-serif: var(--font-merriweather, Georgia, serif);
```

## 5. Tipografía

- **Sans (interfaz, cuerpo):** `Inter` 300–900. Clase raíz `font-sans`. Se usa en toda la navegación, párrafos, UI.
- **Serif (titulares institucionales):** `Merriweather` weights `300,400,700,900`. Se usa con la clase `font-serif` para `h1`/`h2` y títulos de tarjetas de autoridades/institución.

> **Nota sobre el fallback:** el `layout.tsx` raíz carga también `Geist`/`Geist_Mono` (`--font-geist-sans`), pero NO se aplica al diseño público. `Inter`(público) y `Merriweather` son las que se ven; `Geist` solo queda como respaldo en `--font-sans`/`--font-serif` si no cargan Inter/Merriweather.

Carga en `src/app/(public)/layout.tsx`:
```ts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400","700","900"], variable: "--font-merriweather" })
```

Patró común de títulos: `text-3xl font-extrabold tracking-tight text-foreground font-serif` (hero), `text-2xl font-bold font-serif` (secciones internas).

## 6. Radio de esquinas (border-radius = 0.75rem)

- `rounded-lg` → `0.75rem` (predeterminado en botones, chips)
- `rounded-md` → `calc(0.75rem - 2px)` ≈ `0.625rem`
- `rounded-xl` → `calc(0.75rem + 4px)` ≈ `1rem`
- `rounded-2xl` → `calc(0.75rem + 8px)` ≈ `1.25rem` (tarjetas grandes)
- Chips pequeños suelen usar `rounded-full`.

## 7. Botones (cva)

`src/components/ui/button.tsx` — variaciones:
- `default`: `bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`
- `destructive`: `bg-destructive text-destructive-foreground ... hover:bg-destructive/90`
- `outline`: `border border-input bg-background ... hover:bg-accent`
- `secondary`: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- `ghost`: `hover:bg-accent hover:text-accent-foreground`
- `link`: `text-primary underline-offset-4 hover:underline`
- `success`: `bg-green-600 text-white hover:bg-green-700`
- `warning`: `bg-yellow-500 text-white hover:bg-yellow-600`

Tamaños: `default` `h-10 px-4`, `sm` `h-9 px-3`, `lg` `h-11 px-8`, `xl` `h-12 px-10`, `icon` `h-10 w-10`, `icon-sm` `h-8 w-8`, `icon-lg` `h-12 w-12`.
Base: `[&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring`.

## 8. Patrones decorativos (clases globales)

| Clase | Descripción |
|-------|-------------|
| `.bg-pattern-dots` | Puntos (marrón `rgba(90,55,30,.13)` / blanco en dark), `background-size: 22px 22px` |
| `.bg-pattern-grid` | Rejilla naranja `rgba(228,98,18,.06)` / 40px |
| `.liquid-glass` | Efecto espejo cálido náutico con gradiente + `inset 0 1px 0` highlight + sombra [ver código en globals.css] |
| `.glass-header` | Header translúcido `rgba(255,255,255,.92)` |
| `.glass-card` | Tarjeta glass `rgba(255,255,255,.95)` + borde cálido |
| `.heading-kicker` | Eyebrow: `0.75rem`, `600`, `uppercase`, `letter-spacing .1em`, `color primary` |
| `.section-heading-line` | Línea de 4rem×0.25rem gradiente `var(--primary) → #E2BA00` |
| `.card-hover` | Transición `300ms`, hover `box-shadow: 0 10px 15px -3px rgba(228,98,18,.15)` |

## 9. Fondo y texturas

- `body` tiene fondo radial: `radial-gradient(ellipse 120% 55% at 50% -12%, rgba(252,248,243,.5), transparent 60%)` (en dark `rgba(38,33,28,.7)`).
- Se implementan también variantes `oklch()` del fondo dentro del `@supports (color: oklch(...))`.
- Scrollbars personalizadas: ancho 8px, thumb naranja translúcido `rgba(234,88,12,.25)`, hover `.5`.

## 10. ⚠️ PITFALL — Opacidad en Android (`bg-primary/10` + `text-primary`)

**NO combinar `bg-*/10|15|20|...` con `text-primary`** en chips/cajas de icono.

- En navegadores/WebViews Android que **no soportan `color-mix()`**, la utilidad `bg-primary/10` compila con fallback `background-color: var(--primary)` = **naranja sólido**.
- Si además el contenido usa `text-primary` (naranja), queda *naranja sobre naranja* → **invisible**. Funciona en Chrome de escritorio, falla en móvil.
- **Fix correcto:** fondo sólido + texto de alto contraste:
  ```html
  <div class="bg-primary text-primary-foreground"> <!-- blanco sobre naranja --> </div>
  ```
- Opcional (usado en este proyecto): definir fallbacks `rgba` manuales en `globals.css`:
  ```css
  .bg-primary\/10 { background-color: rgba(228,98,18,.1); }
  .dark .bg-primary\/10 { background-color: rgba(248,112,37,.1); }
  ```

## 11. Patrón de tarjetas / chips de icono (recomendado)

El sello del diseño: icono en chip de color primario + texto de alto contraste.

```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
  <Icon className="h-5 w-5" />
</div>
```

Tarjetas de contenido:
```tsx
<div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all">
```

## 12. Notas de datos institucionales (referencia)

- Marca: **Gaceta Municipal de Mairana** • "Gaceta Oficial del Gobierno Autónomo Municipal de Mairana".
- Alcalde: **Andrés Fidel Rocha Rosales**.
- "Capital Tabacalera de Bolivia" • Fundación **24-sep-1875** • **12,735** habitantes • **137 km** de Santa Cruz • **19 °C** • Provincia Florida • AMDECRUZ: Región Valles.

---

*Basado en el proyecto GacetaMunicipalMairana (Next.js 16 + Tailwind v4).*