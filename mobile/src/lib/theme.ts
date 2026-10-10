// Clean, light design: white cards on soft grey, one red accent.
export const colors = {
    bg: "#f4f4f6",
    surface: "#ffffff",
    field: "#ebebef",
    text: "#16161a",
    muted: "#8a8a94",
    faint: "#c7c7cf",
    border: "#ececf0",
    accent: "#ef3b3f",
    accentSoft: "#fde8e8",
    indigo: "#4f46e5",
    purple: "#a855f7",
    teal: "#14b8a6",
    green: "#22a565",
    white: "#ffffff"
};

export const fonts = {
    regular: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semibold: "Outfit_600SemiBold",
    bold: "Outfit_700Bold"
};

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

/** Soft drop shadow used for every card. */
export const shadow = {
    shadowColor: "#1c1c2e",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
} as const;

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
    varastettu: { bg: "#fde8e8", fg: "#e0262c" },
    ilmoitettu: { bg: "#e3f6ec", fg: "#1c9a5b" },
    löytynyt: { bg: "#e6eeff", fg: "#2f5fd0" },
    rekisteröity: { bg: "#f2e9fd", fg: "#8a3fd8" }
};
