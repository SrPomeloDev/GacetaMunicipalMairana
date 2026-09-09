# Sugerencias de diseño — Gaceta Municipal de Mairana

> Ideas visuales **sobrias** para un sitio institucional. Todas con **CSS puro**
> (sin dependencias nuevas como framer-motion o tsparticles) y respetando
> `prefers-reduced-motion`. Ninguna está implementada: este archivo es solo propuesta.
> Ver también `CONTEXTO-ESTETICA.md` (reglas duras) antes de implementar cualquiera.

## Convenciones comunes a todas

- Duraciones 150–600 ms, easing `ease-out` por defecto.
- Envolver animaciones continuas en `@media (prefers-reduced-motion: reduce)` para
  desactivarlas; los reveals deben mostrar el contenido final sin animación.
- No alterar textos/ids cubiertos por E2E (`#email`, `#password`, `Iniciar Sesión`).
- Tras implementar: `npx tsc --noEmit` + `npm run lint` + `npm run build`.

---

## 1. Scroll-reveal sutil ⭐ recomendada

**Qué**: dar vida real a `src/components/ui/reveal.tsx` (hoy es un wrapper sin efecto).
**Cómo**: IntersectionObserver que añade clase visible una sola vez;
`opacity-0 translate-y-3` → `opacity-100 translate-y-0`, `duration-500`.
**Dónde**: secciones del home y encabezados de páginas públicas (ya usan `<Reveal>`).
**Esfuerzo**: bajo (1 componente + hook). **Riesgo**: bajo; el contenido debe ser
visible por defecto si JS falla (usar la clase solo desde el observer).

## 2. Partículas flotantes en el héroe ⭐ recomendada

**Qué**: 8–12 puntos ámbar/naranja flotando sobre el héroe del home.
**Cómo**: `div` absolutos con `border-radius: full`, tamaños 3–6px, opacidades
0.15–0.35, keyframes `float` propios (subida lenta 8–14 s + deriva lateral leve,
`animation-delay` escalonado), contenedor `aria-hidden` y `pointer-events-none`.
**Dónde**: solo `src/app/(public)/page.tsx` (héroe).
**Esfuerzo**: bajo. **Riesgo**: bajo si son pocas y tenues; evitar en móvil
de gama baja (ocultar con `hidden sm:block` si hace falta).

## 3. Contadores animados

**Qué**: las cifras institucionales del home (población 12,735, distancia,
fundación, temperatura) con count-up al entrar en viewport.
**Cómo**: hook `useCountUp(valorFinal, duracion ~1200ms, ease-out)` + formateo
con separador de miles; se dispara con IntersectionObserver una vez.
**Esfuerzo**: medio-bajo. **Riesgo**: formateo de números (usar `toLocaleString("es-BO")`).

## 4. Sheen en botones primarios

**Qué**: brillo que cruza el botón al hover.
**Cómo**: en `src/components/ui/button.tsx`, variante `default`: pseudo-elemento
`::after` con gradiente blanco translúcido, `translate-x-[-120%]` →
`translate-x-[120%]` en 600 ms, `overflow-hidden` en el botón.
**Esfuerzo**: bajo. **Riesgo**: no aplicar a variantes `ghost`/`outline` (se vería sucio).

## 5. Subrayado animado en nav

**Qué**: links del header con subrayado que crece en hover/active.
**Cómo**: `relative` + `::after` (`h-0.5 bg-primary`, `scale-x-0` →
`scale-x-100`, `origin-left`, 200 ms); el link activo lo mantiene al 100%.
**Dónde**: `src/components/layout/header.tsx` (nav desktop) y footer si se quiere.
**Esfuerzo**: bajo. **Riesgo**: ninguno visual relevante.

## 6. Shimmer en skeletons

**Qué**: gradiente animado sobre los estados de carga existentes.
**Cómo**: clase `.skeleton-shimmer` con `background: linear-gradient(...)` +
keyframes `shimmer` (desplaza `background-position`), aplicada en
`src/components/ui/skeleton.tsx`.
**Esfuerzo**: bajo. **Riesgo**: ninguno.

## 7. Transiciones de cards unificadas

**Qué**: complementar el zoom ya agregado (`group-hover:scale-105`) con
elevación: `hover:-translate-y-1` + `hover:shadow-lifted` + `transition-all duration-300`.
**Dónde**: tarjetas de noticias, normativa, trámites, transparencia.
**Esfuerzo**: bajo (solo clases). **Riesgo**: revisar que no rompa grids densos en móvil.

## 8. Micro-interacción en el toggle de tema (opcional)

**Qué**: rotación suave del icono sol/luna al cambiar (`rotate-90 scale` con transición).
**Esfuerzo**: mínimo. **Riesgo**: ninguno.

---

## Descartadas a propósito

- **Tilt 3D / parallax pesado**: exagerado para sitio institucional, malo en táctil.
- **Librerías (framer-motion, tsparticles, GSAP)**: peso extra injustificado;
  todo lo anterior se logra con CSS + un hook pequeño.
- **Autoplay de video / carruseles automáticos**: distraen y dañan performance y accesibilidad.
