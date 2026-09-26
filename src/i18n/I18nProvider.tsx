"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DICTIONARIES, type DictKey, type Lang } from "./dictionaries";

export const LANG_COOKIE = "lang";

type Vars = Record<string, string | number>;

interface I18n {
    lang: Lang;
    t: (key: DictKey, vars?: Vars) => string;
    /** Translates a stored (Finnish) value like a bike type, colour or status; falls back to the value. */
    tv: (prefix: "type" | "color" | "status" | "reason", value: string | null | undefined) => string;
    setLang: (lang: Lang) => void;
    locale: string;
}

const I18nContext = createContext<I18n | null>(null);

const LOCALES: Record<Lang, string> = { fi: "fi-FI", sv: "sv-FI", en: "en-GB" };

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
    const router = useRouter();

    const t = useCallback((key: DictKey, vars?: Vars) => {
        let text = DICTIONARIES[lang][key] ?? DICTIONARIES.fi[key] ?? key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
        }
        return text;
    }, [lang]);

    const tv = useCallback((prefix: "type" | "color" | "status" | "reason", value: string | null | undefined) => {
        if (!value) return "";
        const key = `${prefix}.${value}` as DictKey;
        return DICTIONARIES[lang][key] ?? value;
    }, [lang]);

    const setLang = useCallback((next: Lang) => {
        document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
    }, [router]);

    const value = useMemo(() => ({ lang, t, tv, setLang, locale: LOCALES[lang] }), [lang, t, tv, setLang]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
    return ctx;
}
