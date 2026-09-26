import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tarkista sarjanumero ennen ostoa | BikeBack",
    description: "Ostamassa käytettyä pyörää? Tarkista ilmaiseksi, onko sarjanumero ilmoitettu varastetuksi."
};

export default function CheckSerialLayout({ children }: { children: React.ReactNode }) {
    return children;
}
