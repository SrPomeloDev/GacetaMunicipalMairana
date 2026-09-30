export type CodigoUpload =
  | "TAMANO_EXCEDIDO"
  | "TIPO_NO_PERMITIDO"
  | "FORMATO_INVALIDO"
  | "CUOTA_LLENA"
  | "RATE_LIMIT"
  | "SIN_PERMISOS"
  | "NO_AUTORIZADO"
  | "SIN_ARCHIVO"
  | "ERROR_SISTEMA"

export interface RespuestaUploadError {
  error: string
  codigo: CodigoUpload
  limiteMb?: number
  pesoMb?: number
  pesoOptimizadoMb?: number
  restanteMb?: number
  cuotaMb?: number
  reintentarEnSeg?: number
  formatos?: string[]
}

export function formatearTamano(bytes: number): string {
  const mb = bytes / 1048576
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  if (mb >= 100) return `${Math.round(mb)} MB`
  if (mb >= 10) return `${mb.toFixed(0)} MB`
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  const kb = bytes / 1024
  if (kb >= 100) return `${Math.round(kb)} KB`
  return `${Math.max(1, Math.round(kb))} KB`
}

export function esRespuestaUploadError(data: unknown): data is RespuestaUploadError {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  return typeof d.error === "string" && typeof d.codigo === "string"
}

const SUGERENCIA_PDF =
  "Los PDF no se comprimen automáticamente: reduce la calidad de las imágenes que contiene o divídelo en partes antes de subirlo."

const SUGERENCIA_COMPRIMIR_INSUFICIENTE =
  "Ya intentamos optimizarla automáticamente y no fue suficiente. Reduce las dimensiones de la imagen o baja la calidad al exportarla como JPG."

function numero(valor: number | undefined, decimales = 1): string {
  if (valor === undefined || !Number.isFinite(valor)) return "?"
  return valor.toFixed(decimales).replace(/\.0$/, "")
}

export function sugerenciaParaCodigo(datos: RespuestaUploadError): string {
  switch (datos.codigo) {
    case "TAMANO_EXCEDIDO": {
      const optimizado = datos.pesoOptimizadoMb
      if (optimizado !== undefined) {
        return `${SUGERENCIA_COMPRIMIR_INSUFICIENTE} Pesaba ${numero(datos.pesoMb)} MB y quedó en ${numero(optimizado)} MB, sobre el límite de ${numero(datos.limiteMb, 0)} MB.`
      }
      return `${SUGERENCIA_PDF} El límite de este campo es ${numero(datos.limiteMb, 0)} MB.`
    }
    case "TIPO_NO_PERMITIDO": {
      const formatos = datos.formatos?.length ? datos.formatos.join(", ") : null
      return formatos
        ? `Este campo solo admite ${formatos}. Exporta el archivo a uno de esos formatos e inténtalo de nuevo.`
        : "Exporta el archivo a un formato admitido e inténtalo de nuevo."
    }
    case "FORMATO_INVALIDO":
      return "El contenido del archivo no coincide con su extensión. Vuelve a exportarlo y súbelo de nuevo."
    case "CUOTA_LLENA": {
      const cuota = datos.cuotaMb
      const restante = datos.restanteMb
      const base =
        restante !== undefined && restante > 0
          ? `Ya no cabe: solo quedan ${numero(restante)} MB libres.`
          : `El portal alcanzó su cuota de ${cuota !== undefined ? `${numero(cuota, 0)} MB` : "almacenamiento"}.`
      return `${base} Borra archivos antiguos desde el propio registro o avisa al administrador.`
    }
    case "RATE_LIMIT":
      return `Espera ${datos.reintentarEnSeg ?? 60} segundos antes de volver a intentarlo.`
    case "SIN_PERMISOS":
      return "Tu rol no tiene permiso para subir archivos en este módulo. Pídeselo a un administrador."
    case "NO_AUTORIZADO":
      return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo otra vez."
    default:
      return "Inténtalo de nuevo en unos segundos. Si el problema persiste, avisa al administrador."
  }
}

export function esSugerenciaDeImagen(config: { comprimir: boolean } | null | undefined): boolean {
  return Boolean(config?.comprimir)
}

export function tituloParaCodigo(datos: RespuestaUploadError): string {
  switch (datos.codigo) {
    case "TAMANO_EXCEDIDO":
      return "El archivo supera el tamaño permitido"
    case "TIPO_NO_PERMITIDO":
      return "Tipo de archivo no admitido"
    case "FORMATO_INVALIDO":
      return "El archivo no coincide con su formato"
    case "CUOTA_LLENA":
      return "El portal se quedó sin espacio de almacenamiento"
    case "RATE_LIMIT":
      return "Demasiadas subidas seguidas"
    case "SIN_PERMISOS":
      return "No tienes permisos para subir archivos"
    case "NO_AUTORIZADO":
      return "Tu sesión expiró"
    case "SIN_ARCHIVO":
      return "No se envió ningún archivo"
    default:
      return "No se pudo subir el archivo"
  }
}
