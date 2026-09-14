# Gaceta Municipal — Panel de Administración

**URL:** `/admin/login`  
**Acceso:** Email y contraseña definidos en Supabase Auth.

---

## 1. Panel de Control (`/admin/dashboard`)

Resumen general del sistema con estadísticas en tiempo real:

- Total de normativas publicadas, noticias y trámites activos
- Últimas noticias publicadas
- Conteo de usuarios, autoridades y dependencias registrados
- Acceso rápido a secciones principales

---

## 2. Normativa (`/admin/normativa`)

Gestión completa de normativa municipal (leyes, decretos, resoluciones, ordenanzas, acuerdos).

| Campo | Descripción |
|---|---|
| Número | Identificador oficial (ej. 01/2026) |
| Estado | Vigente · Derogada · Modificada · Suspendida |
| Título | Nombre descriptivo |
| Slug | URL amigable (se genera automáticamente) |
| Categoría | Tipo de norma (ordenanza, decreto, resolución, etc.) |
| Dependencia | Órgano que emite la norma |
| Fecha de Aprobación | Fecha en que se aprueba |
| Fecha de Publicación | Fecha en que se publica oficialmente |
| Fecha de Vigencia | Desde cuándo es aplicable |
| Número de Páginas | Para el sellado físico |
| Resumen | Descripción breve |
| Texto completo | Cuerpo del documento (si no se sube PDF) |
| Archivo PDF | Documento escaneado subido a Supabase Storage |
| Publicada | Visible / Oculta al público |

**Relaciones (sección Modificaciones):**

| Campo | Descripción |
|---|---|
| Normativa que modifica | Referencia a otra norma |
| Tipo de modificación | Modifica · Complementa · Deroga |
| Fecha de la modificación | Fecha del acto |
| Artículos afectados | Números de artículo modificados |
| Descripción | Detalle del cambio |

**Buscar normativa:** El buscador global (barra de navegación pública) usa la función SQL `buscar_normativa()` — búsqueda full-text por título, número, resumen y texto completo.

---

## 3. Noticias (`/admin/noticias`)

Publicación de noticias institucionales, enlazadas o propias.

| Campo | Descripción |
|---|---|
| Título | Encabezado de la noticia |
| Slug | URL amigable |
| Categoría | Clasificación temática |
| Fecha de Publicación | Fecha de publicación |
| Imagen Principal | Foto principal (sube a Storage `noticias-imagenes`) |
| Enlace de Facebook | Si la noticia viene de Facebook, pegar el enlace aquí |
| Resumen | Extracto corto (obligatorio si no hay enlace de Facebook) |
| Contenido | Cuerpo completo del artículo (obligatorio si no hay enlace de Facebook) |
| Noticia Destacada | Aparece destacada en la portada |
| Publicada | Visible / Oculta al público |

---

## 4. Autoridades (`/admin/autoridades`)

Registro y edición de autoridades municipales.

| Campo | Descripción |
|---|---|
| Nombre Completo | Nombre y apellidos |
| Cargo | Ej. Alcalde, Presidente del H. Concejo, etc. |
| Tipo | Alcalde · Concejal · Funcionario · Director |
| Foto | Imagen del funcionario (Storage `noticias-imagenes`) |
| Email | Dirección de contacto (opcional) |
| Teléfono | Número de contacto (opcional) |
| Orden | Posición de visualización (menor = primero) |
| Activo | Visible / Oculta al público |

> La foto del Alcalde se usa automáticamente en el recuadro del home si no se sube una desde Configuración.

---

## 5. Dependencias (`/admin/dependencias`)

Catálogo de unidades y dependencias municipales.

| Campo | Descripción |
|---|---|
| Nombre | Nombre de la dependencia |
| Sigla | Acrónimo (ej. GAM, DITEC) |
| Descripción | Función de la dependencia |
| Jefe de Dependencia | Nombre del responsable (opcional) |
| Email | Correo institucional (opcional) |
| Teléfono | Línea directa (opcional) |
| Orden | Posición de visualización |
| Activo | Visible / Oculta al público |

---

## 6. Categorías (`/admin/categorias`)

Gestión de categorías para normativa, noticias, trámites y transparencia.

| Campo | Descripción |
|---|---|
| Nombre | Nombre de la categoría |
| Slug | URL amigable |
| Descripción | Descripción breve |
| Tipo | normativa · noticias · tramites · transparencia |
| Color | Color de identificación visual |
| Orden | Posición de visualización |
| Activo | Visible / Oculta al público |

---

## 7. Concejo Municipal (`/admin/concejo`)

Gestión de sesiones del Concejo y comisiones de trabajo.

### Sesiones (`/admin/concejo/sesiones/[id]`)

| Campo | Descripción |
|---|---|
| Sesión N° | Número correlativo |
| Fecha | Fecha de la sesión |
| Tipo | Ordinaria · Extraordinaria · Solemne |
| Agenda | Puntos a tratar (texto libre) |
| Acta | Documento PDF del acta oficial |

### Comisiones (`/admin/concejo/comisiones/[id]`)

| Campo | Descripción |
|---|---|
| Concejal | Nombre del miembro |
| Comisión | Nombre de la comisión (ej. Hacienda, Obras) |
| Cargo | Presidente · Vocal · Suplente |

---

## 8. Transparencia (`/admin/transparencia`)

Documentos de rendición de cuentas bajo la Ley 341.

| Campo | Descripción |
|---|---|
| Título | Nombre del documento |
| Categoría | Tipo (presupuesto, POA, PEI, auditoría, contratación, etc.) |
| Fecha | Fecha de publicación |
| Descripción | Contenido del documento |
| Archivo PDF | Documento escaneado subido a Storage |
| Publicada | Visible / Oculta al público |

---

## 9. Trámites (`/admin/tramites`)

Guía ciudadana de trámites y procedimientos municipales.

| Campo | Descripción |
|---|---|
| Título | Nombre del trámite |
| Slug | URL amigable |
| Descripción | Paso a paso del procedimiento |
| Requisitos | Documentos y condiciones requeridos |
| Dependencia | Unidad encargada |
| Tiempo Estimado | Duración aproximada |
| Costo | Tarifa en bolivianos (si aplica) |
| Formulario PDF | Formulario descargable (si aplica) |
| Activo | Visible / Oculta al público |

---

## 10. Galería (`/admin/galeria`)

Álbum fotográfico de eventos, obras y actividades municipales.

| Campo | Descripción |
|---|---|
| Título | Nombre de la imagen |
| Descripción | Contexto de la foto |
| Álbum | Agrupación (ej. "Obras 2026", "Fiestas Patrias") |
| Imagen | Archivo subido a Storage `galeria` |
| Fecha | Fecha de la fotografía |
| Orden | Posición dentro del álbum |

---

## 11. Contrataciones (`/admin/contrataciones`)

Licitaciones, convocatorias y procesos de contratación pública (SICOES).

| Campo | Descripción |
|---|---|
| Título | Nombre de la contratación |
| Tipo | Licitación · Contratación Directa · Consulta de Precios · Subasta |
| Modalidad | Ej. ANPE 01/2026 |
| Objeto | Bien, obra o servicio a contratar |
| Monto referencial | Monto estimado en Bs. |
| Empresa adjudicada | Razón social ganadora (si aplica) |
| Fecha de publicación | Fecha de apertura |
| Fecha límite de presentación | Fecha de cierre |
| Fecha de adjudicación | Fecha de resolución |
| Estado | En proceso · Adjudicada · Desierta · Cancelada |
| Documento PDF | Bases, pliegos o resultados |
| Publicada | Visible / Oculta al público |

---

## 12. Suscripciones (`/admin/suscripciones`)

Gestión de suscriptores al boletín municipal.

| Acción | Descripción |
|---|---|
| Ver lista | Emails registrados con fecha y estado |
| Activar / Desactivar | Control manual de suscripciones |
| Eliminar | Borrar un suscriptor de la lista |

---

## 13. Mensajes (`/admin/mensajes`)

Bandeja de mensajes del formulario de contacto ciudadano.

| Campo | Descripción |
|---|---|
| Remitente | Nombre + email del ciudadano |
| Asunto | Temo del mensaje |
| Mensaje | Contenido completo |
| Fecha | Fecha y hora de recepción |
| Estado | Nuevo · En revisión · Respondido · Cerrado |
| Respuesta | Texto de respuesta del staff (si se responde) |
| Responder | Enviar respuesta desde el panel |

**Categoría del mensaje (filtro):** General · Trámite · Reclamo · Denuncia · Sugerencia · Información pública · Normativa  
**Mensajes anónimos:** El formulario permite enviar anónimamente en categoría Denuncia.  
**Filtros rápidos:** Todos · No leídos · Denuncias · Sin responder. También se puede filtrar por estado específico (nuevo, en revisión, respondido, cerrado).

---

## 14. Usuarios (`/admin/usuarios`)

Gestión de cuentas de acceso al panel.

| Campo | Descripción |
|---|---|
| Nombre Completo | Nombre del usuario |
| Email | Correo (usado como credencial de login) |
| Rol | admin · editor · publicador |
| Dependencia | Unidad a la que pertenece |
| Cuenta activa | Habilitada / Deshabilitada |
| Contraseña | Restablecer contraseña desde el panel |

### Matriz de Permisos por Rol

Cada usuario tiene permisos por módulo (crear, editar, eliminar, publicar). Los roles por defecto son:

| Rol | Permisos por defecto |
|---|---|
| **Admin** | Todo (crear, editar, eliminar, publicar en todos los módulos) |
| **Editor** | Crear, editar, publicar en todos los módulos excepto: eliminar, usuarios y configuración |
| **Publicador** | Solo publicar en todos los módulos |

Los permisos se pueden personalizar por usuario, sobrescribiendo los defaults del rol.

---

## 15. Configuración (`/admin/configuracion`)

Configuración general del municipio y apariencia del portal. **Sección con los cambios más recientes.**

### Información del Municipio

| Campo | Se refleja en |
|---|---|
| Nombre del Municipio | Footer y cabecera del sitio |
| Lema | Recuadro del alcalde (home), footer |
| Dirección | Footer — sección Contacto |
| Teléfono | Footer — sección Contacto; header (versión de escritorio) |
| Email | Footer — sección Contacto |
| Horario de Atención | Footer — sección Contacto; header (escritorio) |

### Alcaldía (NUEVO)

| Campo | Se refleja en |
|---|---|
| Nombre del Alcalde | Recuadro del alcalde en el home |
| Cargo / Gestión | Subtítulo del alcalde en el home |
| Descripción del Municipio | Texto del recuadro del alcalde en el home |
| Foto del Alcalde | Imagen del recuadro del alcalde en el home (sube a `noticias-imagenes`) |

> Si no se sube foto desde aquí, el sistema busca automáticamente una foto en la tabla `autoridades` del tipo "Alcalde". Si tampoco existe, usa la imagen por defecto `/images/AlcaldeMairana.png`.

### Redes Sociales (NUEVO)

| Campo | Se refleja en |
|---|---|
| Facebook | Botón de red social en el footer (solo se muestra si está configurado) |
| Twitter / X | Botón de red social en el footer |
| YouTube | Botón de red social en el footer |
| Instagram | Botón de red social en el footer |

> Los botones de redes sociales solo aparecen en el footer si tienen una URL configurada. Si el campo está vacío, el botón no se renderiza.

### Personalización

| Campo | Se refleja en |
|---|---|
| Color Institucional | Guardado pero **no aplicado** — el sitio usa el naranja #EA580C fijo para preservar la identidad visual. Si se necesita cambiar, se debe editar manualmente el CSS. |
| Logo del Municipio | Header del sitio (reemplaza la imagen estática `/images/mairana-corazon-valles.png`); se sube a `noticias-imagenes` |
| **Imagen de Fondo del Portal** (NUEVO) | Hero del home y portada de la Gaceta. Dimensión recomendada: **1920×1080 px**. Se sube a `noticias-imagenes`. Si no se configura, usa `/images/plaza.jpg` como fondo por defecto. |

---

## 16. Mi Cuenta (`/admin/perfil`)

Edición del perfil del usuario logueado.

| Campo | Descripción |
|---|---|
| Nombre Completo | Nombre y apellidos del usuario |
| Foto de Perfil | Avatar que aparece en el header y sidebar (sube a `noticias-imagenes`) |
| Email | Correo de login (solo lectura) |
| Rol | Rol asignado (solo lectura) |
| Dependencia | Unidad a la que pertenece (solo lectura) |
| Preferencia de Tema | Claro · Oscuro · Sistema — se guarda en la cuenta y se sincroniza entre dispositivos |
| Cambio de Contraseña | Nueva contraseña (mínimo 6 caracteres) |

---

## 17. Modo Letra Grande (Accesibilidad)

Barra flotante visible en todas las páginas públicas (esquina superior derecha):

| Acción | Descripción |
|---|---|
| **A−** | Reduce el tamaño del texto general |
| **Aa** | Alterna el tamaño entre normal y grande (persiste en `localStorage`) |
| **Dictado por voz** | Activa el reconocimiento de voz (Web Speech API) — lee en voz alta el contenido de la página actual. Funciona en Chrome, Edge y Safari. Detener con clic en el botón rojo. |

---

## 18. Cambios Recientes Implementados

### Recuadro del Alcalde en el Home

A partir de la sección *Alcaldía* en Configuración, el recuadro que aparece en la página principal muestra:

- **Foto:** Desde Configuración > Alcaldía > Foto del Alcalde
- **Nombre:** Desde Configuración > Alcaldía > Nombre del Alcalde
- **Cargo:** Desde Configuración > Alcaldía > Cargo / Gestión
- **Descripción del Municipio:** Desde Configuración > Alcaldía > Descripción
- **Lema:** Desde Configuración > Información del Municipio > Lema

Los valores por defecto son: Andres Fidel Rocha Rosales, Alcalde Municipal — Gestión 2026, "Comprometidos con el desarrollo sostenible..." y "Corazón de los Valles".

### Footer Dinámico

El footer del sitio ahora lee toda su información de la base de datos (tabla `configuracion`):

- Dirección, teléfono, email y horario aparecen solo si están configurados
- Los botones de redes sociales aparecen solo si tienen URL
- El lema y el nombre del municipio se muestran con los valores de la BD
- Los cambios se reflejan inmediatamente tras guardar (no requiere redeploy)

### Header Dinámico

La barra superior del sitio también lee de configuración:

- Teléfono de contacto (escritorio)
- Horario de atención (escritorio)
- Logo del municipio (si se configura, reemplaza la imagen estática)

### Imagen de Fondo del Portal

El hero del home y la portada de la Gaceta usan una imagen de fondo configurable:

- **Si se configura:** Se muestra la imagen subida desde Configuración > Personalización > Imagen de Fondo del Portal
- **Si no se configura:** Se usa `/images/plaza.jpg` por defecto
- **Recomendación:** 1920×1080 px, formato JPG o PNG

### Nota Técnica (para desarrolladores)

Las páginas públicas del portal (`/`, `/gaceta`, `/autoridades`, `/transparencia`, etc.) se renderizan en tiempo real (`force-dynamic`) para que los cambios en Configuración se reflejen inmediatamente. Si en el futuro se necesita optimizar la velocidad de carga, se puede migrar a Incremental Static Regeneration (ISR) usando revalidación por tiempo o por revalidación on-demand.
