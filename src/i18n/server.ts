import { cookies, headers } from "next/headers";
import { LANGS, type Lang } from "./dictionaries";

/**
 * Current UI language: the `lang` cookie if set, otherwise the browser's
 * Accept-Language (sv / en), otherwise Finnish.
 */
export async function getLang(): Promise<Lang> {
    const fromCookie = (await cookies()).get("lang")?.value;
    if (fromCookie && (LANGS as readonly string[]).includes(fromCookie)) return fromCookie as Lang;

    const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
    for (const part of accept.split(",")) {
        const code = part.trim().slice(0, 2);
        if (code === "fi") return "fi";
        if (code === "sv") return "sv";
        if (code === "en") return "en";
    }
    return "fi";
}
