// Same playful palette as the website (src/app/globals.css).
export const colors = {
    cream: "#fdf8e4",
    shell: "#efeadb",
    surface: "#fffdf6",
    maroon: "#3a0b1c",
    muted: "#6e4b55",
    border: "#eadcc6",
    yellow: "#ffe27a",
    pink: "#f4a7c3",
    lavender: "#c4c7ff",
    mint: "#a8e6c1",
    raspberry: "#a3175a",
    red: "#e5484d",
    white: "#ffffff"
};

export const fonts = {
    display: "Oswald_700Bold",
    displayMedium: "Oswald_600SemiBold",
    body: "Outfit_400Regular",
    bodyMedium: "Outfit_500Medium",
    bodyBold: "Outfit_700Bold"
};

export const radius = { sm: 12, md: 18, lg: 24, pill: 999 };

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
    varastettu: { bg: "#fee2e2", fg: "#c62828" },
    ilmoitettu: { bg: "#dcf5e6", fg: "#1f7a44" },
    löytynyt: { bg: "#e3edff", fg: "#1f4fb5" },
    rekisteröity: { bg: "#f1e4fb", fg: "#6a1b9a" }
};
