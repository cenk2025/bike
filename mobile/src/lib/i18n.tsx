import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getLocales } from "expo-localization";
import { DICTIONARIES, LANGS, type DictKey, type Lang } from "@shared/i18n/dictionaries";
import { MOBILE_STRINGS, type MobileKey } from "./strings";

export type Key = DictKey | MobileKey;
type Vars = Record<string, string | number>;

const STORAGE_KEY = "bikeback.lang";
const LOCALES: Record<Lang, string> = { fi: "fi-FI", sv: "sv-FI", en: "en-GB" };

function deviceLang(): Lang {
    for (const l of getLocales()) {
        const code = l.languageCode as Lang | null;
        if (code && (LANGS as readonly string[]).includes(code)) return code;
    }
    return "fi";
}

function initialLang(): Lang {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang;
    } catch { /* storage not ready */ }
    return deviceLang();
}

interface I18n {
    lang: Lang;
    locale: string;
    t: (key: Key, vars?: Vars) => string;
    /** Translates a stored Finnish value (type, colour, status, match reason). */
    tv: (prefix: "type" | "color" | "status" | "reason", value: string | null | undefined) => string;
    setLang: (lang: Lang) => void;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>(initialLang);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    }, [lang]);

    const t = useCallback((key: Key, vars?: Vars) => {
        const mobile = MOBILE_STRINGS[lang] as Record<string, string>;
        const shared = DICTIONARIES[lang] as Record<string, string>;
        let text = mobile[key] ?? shared[key] ?? (MOBILE_STRINGS.fi as Record<string, string>)[key] ?? key;
        if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
        return text;
    }, [lang]);

    const tv = useCallback<I18n["tv"]>((prefix, value) => {
        if (!value) return "";
        return (DICTIONARIES[lang] as Record<string, string>)[`${prefix}.${value}`] ?? value;
    }, [lang]);

    const value = useMemo(() => ({ lang, locale: LOCALES[lang], t, tv, setLang: setLangState }), [lang, t, tv]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
    return ctx;
}

export { LANGS, type Lang };
