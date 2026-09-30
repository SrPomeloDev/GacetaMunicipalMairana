import { createAdminClient } from "@/lib/supabase/admin"
import { storageRefDesdeUrl } from "@/lib/storage-path"
import { invalidarCacheStorage } from "@/lib/storage-quota"

export async function borrarArchivoStorage(url: string | null | undefined): Promise<boolean> {
  if (!url) return false
  const ref = storageRefDesdeUrl(url)
  if (!ref) return false
  const admin = createAdminClient()
  const { error } = await admin.storage.from(ref.bucket).remove([ref.path])
  if (error) return false
  invalidarCacheStorage()
  return true
}

export async function borrarArchivoReemplazando(
  anterior: string | null | undefined,
  nuevo: string | null | undefined
): Promise<void> {
  if (!anterior || anterior === nuevo) return
  await borrarArchivoStorage(anterior)
}
