# Suites E2E con fallos preexistentes

Estado verificado el 2026-09-30, commit `bcb6505`.

Estos tests fallan **antes** de los cambios de Storage/avisos. Se confirmó
haciendo `git stash` de todo el trabajo y reejecutando solo los specs
afectados sobre el árbol limpio: fallan igual. No son una regresión.

## 1. `e2e/tests/portal.spec.js` — 2 tests

Causa: **strict mode violation**. El selector
`getByRole("link", { name: "Gaceta Municipal" })` resuelve a dos elementos,
porque el header tiene el logo (enlace a `/`) y además un enlace de texto
"GACETA MUNICIPAL" (enlace a `/gaceta`).

Playwright aborta el click/visibilidad al haber más de un match.

| Test | Línea | Selector que colisiona |
| --- | --- | --- |
| `home: el CTA del hero lleva a la Gaceta Oficial` | `portal.spec.js:30` | `getByRole("link", { name: "GACETA MUNICIPAL" })` |
| `header: acceso funcionarios lleva al login` | `portal.spec.js:47` | `getByRole("link", { name: "Gaceta Municipal" })` |

Arreglo: desambiguar el locator, por ejemplo
`.getByRole("link", { name: "GACETA MUNICIPAL", exact: true })` o
`page.locator('header a[href="/gaceta"]')`.

## 2. `e2e/tests/portal.spec.js` — 1 test

Causa: **datos**, no selector. El test espera un `<h2>`/heading que
coincida con `/Andres Fidel Rocha/i` en `/autoridades`.

```
Error: element(s) not found
Locator: getByRole('heading', { name: /Andres Fidel Rocha/i })
Timeout: 15000ms
```

El fixture de autoridades en Supabase ya no tiene ese registro con ese
nombre, o cambió de mayúsculas/título. Arreglo: sembrar el dato en
`e2e/provision.js` o actualizar el nombre esperado en
`portal.spec.js:57`.

## 3. `e2e/tests/admin-filters.spec.js` — 1 test

Causa: **el filtro no existe con ese texto**. El helper `selectConOpcion`
busca un `<select>` cuya etiqueta contenga `"Borradores"` y no lo
encuentra en `/admin/noticias`.

```
Error: select con opción "Borradores" no encontrado
  at selectConOpcion (admin-filters.spec.js:25)
  at admin-filters.spec.js:44
```

Arreglo: alinear la opción del `<select>` con el texto que espera el
test, o viceversa. Al ser un `describe` en modo `serial`, este fallo
cancela los 4 tests siguientes de ese archivo.

## 4. `e2e/tests/suscripciones.spec.js` — intermitente

`eliminar suscripción con confirmación masiva` falló en la primera pasada
y pasó en el retry. No es determinista; conviene mirarlo si reaparece.

## Resumen

| Spec | Tests rojos | Motivo |
| --- | --- | --- |
| `portal.spec.js` | 3 | 2 colisión de selector en el header, 1 fixture de autoridades desactualizado |
| `admin-filters.spec.js` | 1 (+4 sin correr) | texto del filtro distinto al esperado; el modo `serial` corta el resto |
| `suscripciones.spec.js` | 0-1 | intermitente |

Todo lo demás está en verde, incluidos los specs que sí suben archivos
(`galeria-crud.spec.js`, `transparencia-crud.spec.js`), que son los que
ejercitan el código de Storage modificado.
