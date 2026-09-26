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

// Approximate city-centre coordinates, used for the map and offered as
// autocomplete suggestions (any city can still be typed).
export const CITY_COORDS: Record<string, [number, number]> = {
    "Helsinki": [60.1699, 24.9384], "Espoo": [60.2055, 24.6559], "Vantaa": [60.2934, 25.0378],
    "Tampere": [61.4978, 23.7610], "Turku": [60.4518, 22.2666], "Oulu": [65.0121, 25.4651],
    "Jyväskylä": [62.2426, 25.7473], "Lahti": [60.9827, 25.6615], "Kuopio": [62.8924, 27.6770],
    "Pori": [61.4851, 21.7974], "Kouvola": [60.8679, 26.7042], "Joensuu": [62.6010, 29.7636],
    "Lappeenranta": [61.0587, 28.1887], "Hämeenlinna": [60.9960, 24.4643], "Vaasa": [63.0951, 21.6165],
    "Seinäjoki": [62.7903, 22.8403], "Rovaniemi": [66.5039, 25.7294], "Mikkeli": [61.6886, 27.2723],
    "Kotka": [60.4664, 26.9458], "Salo": [60.3845, 23.1250], "Porvoo": [60.3932, 25.6650],
    "Kokkola": [63.8385, 23.1307], "Hyvinkää": [60.6305, 24.8597], "Lohja": [60.2486, 24.0653],
    "Järvenpää": [60.4737, 25.0899], "Rauma": [61.1287, 21.5111], "Kajaani": [64.2273, 27.7285],
    "Kerava": [60.4034, 25.1050], "Savonlinna": [61.8699, 28.8796], "Nurmijärvi": [60.4641, 24.8073],
    "Tuusula": [60.4031, 25.0263], "Kirkkonummi": [60.1236, 24.4385], "Kaarina": [60.4072, 22.3683],
    "Kangasala": [61.4639, 24.0650], "Ylöjärvi": [61.5559, 23.5963]
};

export const CITIES = Object.keys(CITY_COORDS);

/** Case-insensitive lookup of a city's coordinates. */
export function cityCoords(city: string | null | undefined): [number, number] | null {
    if (!city) return null;
    const key = CITIES.find(c => c.toLowerCase() === city.trim().toLowerCase());
    return key ? CITY_COORDS[key] : null;
}

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

type TimeKey = "time.justNow" | "time.hours" | "time.days";

/** "2 h sitten" etc. Pass the i18n `t` function for the current language. */
export function formatRelativeTime(dateString: string, t: (key: TimeKey, vars?: Record<string, number>) => string) {
    const diffH = Math.floor((Date.now() - new Date(dateString).getTime()) / 3_600_000);
    if (diffH < 1) return t("time.justNow");
    if (diffH < 24) return t("time.hours", { n: diffH });
    return t("time.days", { n: Math.floor(diffH / 24) });
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

export function bikeTitle(bike: { brand?: string | null; model?: string | null }, unknown = "Tuntematon pyörä") {
    const title = [bike.brand, bike.model].filter(v => v && v !== "Unknown").join(" ");
    return title || unknown;
}
