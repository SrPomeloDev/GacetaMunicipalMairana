import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
    icon: "/images/escudo-mairana.jpg",
    apple: "/images/escudo-mairana.jpg",
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
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("gaceta-theme");var t=s==="dark"?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
