import type { Metadata } from "next"
import { Inter, Merriweather } from "next/font/google"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
})

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
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <Link
        href="/asistente"
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
    </div>
  )
}
