"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { LANGS } from "@/i18n/dictionaries";

export default function LanguageSwitcher() {
    const { lang, setLang, t } = useI18n();
    return (
        <div role="group" aria-label={t("nav.language")} style={{ display: 'flex', gap: '2px', border: '1px solid var(--border)', borderRadius: '8px', padding: '2px', width: 'fit-content' }}>
            {LANGS.map(code => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: lang === code ? 'var(--text)' : 'transparent',
                        color: lang === code ? 'var(--surface)' : 'var(--text-muted)'
                    }}
                >
                    {code}
                </button>
            ))}
        </div>
    );
}
