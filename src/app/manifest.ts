import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "CycleFound – löydä pyöräsi",
        short_name: "CycleFound",
        description: "Ilmoita varastetusta tai löydetystä pyörästä ja saa ilmoitus heti, kun osuma löytyy.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f8f9fa",
        theme_color: "#00e676",
        lang: "fi",
        icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ],
        shortcuts: [
            { name: "Ilmoita varkaus", url: "/ilmoita-varkaudesta" },
            { name: "Löysin pyörän", url: "/loydetyt" },
            { name: "Tarkista sarjanumero", url: "/tarkista" }
        ]
    };
}
