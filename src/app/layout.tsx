import type { Metadata, Viewport } from "next";
import { Oswald, Outfit } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import PwaRegister from "@/components/PwaRegister";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLang } from "@/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL('https://bike.voon.fi'),
  title: "BikeBack | Suojaa ja löydä polkupyöräsi",
  description: "BikeBack on yhteisöpohjainen verkosto varastettujen polkupyörien löytämiseksi. Ilmoita varkaudesta, rekisteröi pyöräsi ja auta muita löytämään omansa. VoonIQ-tuote.",
  keywords: ["kadonnut pyörä", "varastettu polkupyörä", "pyörävarkaus", "Suomi", "löytöpaikka", "yhteisö", "polkupyörä", "VoonIQ"],
  authors: [{ name: "VoonIQ" }],
  appleWebApp: { capable: true, title: "BikeBack", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "BikeBack | Suojaa polkupyöräsi",
    description: "Autamme pyörän omistajia teknologian ja yhteisön avulla. Ilmoita varkaudesta tai löydetystä pyörästä.",
    url: "https://bike.voon.fi",
    siteName: "BikeBack",
    locale: "fi_FI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BikeBack | Suojaa polkupyöräsi",
    description: "Yhteisöpohjainen verkosto varastettujen polkupyörien löytämiseksi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Self-hosted at build time – no runtime request to Google Fonts.
const outfit = Outfit({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-body" });
const oswald = Oswald({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], variable: "--font-heading" });

export const viewport: Viewport = {
  themeColor: "#00e676",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${outfit.variable} ${oswald.variable}`}>
      <body>
        <I18nProvider lang={lang}>
          {children}
          <CookieConsent />
          <PwaRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
