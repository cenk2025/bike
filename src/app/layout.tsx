import type { Metadata } from "next";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "CycleFound | Suojaa ja löydä polkupyöräsi",
  description: "Yhteisöpohjainen verkosto kadonneiden ja varastettujen polkupyörien löytämiseksi. Ilmoita varkaudesta tai auta muita löytämään omansa.",
  keywords: ["bisiklet", "varkaus", "pyöräily", "Suomi", "löytö", "yhteisö", "polkupyörä"],
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
      </body>
    </html>
  );
}
