import type { Metadata } from "next"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-clip">
      <Header />
      <main className="min-h-screen pt-16 sm:pt-[100px] xl:pt-[104px]">{children}</main>
      <Footer />
    </div>
  )
}
