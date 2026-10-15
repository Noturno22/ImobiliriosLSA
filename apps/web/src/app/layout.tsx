import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Serrote Imobiliária — A chave para sua nova história",
    template: "%s | Serrote Imobiliária",
  },
  description:
    "Encontre o imóvel ideal para o seu futuro. Casas, apartamentos e terrenos em Luanda e em toda Angola.",
  applicationName: "Serrote Imobiliária",
  openGraph: {
    type: "website",
    locale: "pt_AO",
    siteName: "Serrote Imobiliária",
    title: "Serrote Imobiliária — Mais que imóveis, entregamos confiança.",
    description:
      "Casas, apartamentos e terrenos num só lugar. Compra, venda, arrendamento e consultoria imobiliária em Angola.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#20334B" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D0F" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
