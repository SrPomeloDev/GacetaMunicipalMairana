const WEBP_CALIDAD = 0.82
const MAX_DIMENSION = 1600

export function comprimirImagenWebP(input: Uint8Array): Promise<Uint8Array<ArrayBuffer> | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve(null)
  if (typeof createImageBitmap !== "function" || typeof OffscreenCanvas === "undefined") {
    return Promise.resolve(null)
  }

  const original = new Blob([input.slice().buffer as ArrayBuffer], { type: "image/*" })

  return createImageBitmap(original)
    .then((bitmap) => {
      const escala = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
      const ancho = Math.max(1, Math.round(bitmap.width * escala))
      const alto = Math.max(1, Math.round(bitmap.height * escala))

      const canvas = new OffscreenCanvas(ancho, alto)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        bitmap.close()
        return null
      }
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(bitmap, 0, 0, ancho, alto)
      bitmap.close()

      return canvas.convertToBlob({ type: "image/webp", quality: WEBP_CALIDAD })
    })
    .then((blob) => (blob && blob.size > 0 && blob.size < original.size ? blob.arrayBuffer().then((b) => new Uint8Array(b)) : null))
    .catch(() => null)
}
