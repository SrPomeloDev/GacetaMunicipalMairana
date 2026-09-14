import type { Metadata } from "next"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"
import { createAdminClient } from "@/lib/supabase/admin"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
}

export const dynamic = "force-dynamic"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAdminClient()
  const { data: config } = await supabase
    .from("configuracion")
    .select("municipio, lema, direccion, telefono, email, horario, logo_url, facebook, twitter, youtube, instagram")
    .eq("id", 1)
    .maybeSingle()

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-clip">
      <Header config={config} />
      <main className="min-h-screen pt-16 sm:pt-[100px] xl:pt-[104px]">{children}</main>
      <Footer config={config} />
    </div>
  )
}