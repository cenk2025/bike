// Shared bike vocabulary and helpers used by the forms, cards and dashboard.

export type BikeStatus = "varastettu" | "ilmoitettu" | "löytynyt" | "rekisteröity";

export const BIKE_TYPES = [
    "Kaupunki",
    "Maastopyörä",
    "Maantie",
    "Sähkö",
    "Lasten",
    "Moottoripyörä",
    "Mopo",
    "Sähköpotkulauta",
    "Muu"
];

export const BIKE_COLORS = [
    "musta", "valkoinen", "harmaa", "hopea", "punainen", "sininen", "vihreä",
    "keltainen", "oranssi", "pinkki", "violetti", "ruskea", "turkoosi", "monivärinen"
];

// Offered as autocomplete suggestions only – any city can be typed.
export const CITIES = [
    "Helsinki", "Espoo", "Vantaa", "Tampere", "Turku", "Oulu", "Jyväskylä", "Lahti",
    "Kuopio", "Pori", "Kouvola", "Joensuu", "Lappeenranta", "Hämeenlinna", "Vaasa",
    "Seinäjoki", "Rovaniemi", "Mikkeli", "Kotka", "Salo", "Porvoo", "Kokkola",
    "Hyvinkää", "Lohja", "Järvenpää", "Rauma", "Kajaani", "Kerava", "Savonlinna",
    "Nurmijärvi", "Tuusula", "Kirkkonummi", "Kaarina", "Kangasala", "Ylöjärvi"
];

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string; solidBg: string; solidFg: string }> = {
    "varastettu":   { label: "Varastettu",   bg: "#fee2e2", fg: "#dc2626", solidBg: "#ff1744", solidFg: "#fff" },
    "ilmoitettu":   { label: "Löydetty",     bg: "#e8f5e9", fg: "#2e7d32", solidBg: "#00e676", solidFg: "#000" },
    "löytynyt":     { label: "Palautettu",   bg: "#e3f2fd", fg: "#1565c0", solidBg: "#2979ff", solidFg: "#fff" },
    "rekisteröity": { label: "Rekisteröity", bg: "#f3e5f5", fg: "#6a1b9a", solidBg: "#8e24aa", solidFg: "#fff" }
};

export function statusStyle(status: string | null | undefined) {
    return STATUS_STYLES[(status || "").toLowerCase()] ?? {
        label: status || "", bg: "#eee", fg: "#333", solidBg: "#333", solidFg: "#fff"
    };
}

export function formatRelativeTime(dateString: string) {
    const diffH = Math.floor((Date.now() - new Date(dateString).getTime()) / 3_600_000);
    if (diffH < 1) return "Juuri nyt";
    if (diffH < 24) return `${diffH} h sitten`;
    return `${Math.floor(diffH / 24)} pv sitten`;
}

// Row shape of the public `bikes_public` view / `search_bikes` RPC.
export interface PublicBike {
    id: string | number;
    brand: string | null;
    model: string | null;
    type: string | null;
    color: string | null;
    city: string | null;
    location: string | null;
    status: string;
    image_url: string | null;
    images: string[] | null;
    description: string | null;
    event_date: string | null;
    created_at: string;
    is_demo: boolean;
    has_serial: boolean;
}

export function bikeTitle(bike: { brand?: string | null; model?: string | null }) {
    const title = [bike.brand, bike.model].filter(v => v && v !== "Unknown").join(" ");
    return title || "Tuntematon pyörä";
}
