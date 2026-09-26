import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL('https://bike.voon.fi'),
  title: "CycleFound | Suojaa ja löydä polkupyöräsi",
  description: "CycleFound on yhteisöpohjainen verkosto varastettujen polkupyörien löytämiseksi. Ilmoita varkaudesta, rekisteröi pyöräsi ja auta muita löytämään omansa. VoonIQ-tuote.",
  keywords: ["kadonnut pyörä", "varastettu polkupyörä", "pyörävarkaus", "Suomi", "löytöpaikka", "yhteisö", "polkupyörä", "VoonIQ"],
  authors: [{ name: "VoonIQ" }],
  appleWebApp: { capable: true, title: "CycleFound", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "CycleFound | Suojaa polkupyöräsi",
    description: "Autamme pyörän omistajia teknologian ja yhteisön avulla. Ilmoita varkaudesta tai löydetystä pyörästä.",
    url: "https://bike.voon.fi",
    siteName: "CycleFound",
    locale: "fi_FI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CycleFound | Suojaa polkupyöräsi",
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

export const viewport: Viewport = {
  themeColor: "#00e676",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body>
        {children}
        <CookieConsent />
        <PwaRegister />
      </body>
    </html>
  );
}
