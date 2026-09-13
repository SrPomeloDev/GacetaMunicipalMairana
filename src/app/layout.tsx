import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/components/accesibilidad/accessibility-provider";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Gaceta Municipal - Mairana",
    template: "%s | Gaceta Municipal - Mairana",
  },
  description: "Plataforma oficial de la Gaceta Municipal de Mairana, Santa Cruz - Capital Tabacalera de Bolivia",
  icons: {
    icon: "/images/mairana-bandera.svg",
    apple: "/images/mairana-bandera.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("gaceta-theme");var t=s==="dark"?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;var k=location.pathname.indexOf("/admin")===0?"gaceta-modo-senior-admin":"gaceta-modo-senior";if(localStorage.getItem(k)==="1"){document.documentElement.classList.add("modo-senior")}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AccessibilityProvider>{children}</AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
