"use client";

import { useI18n } from "@/i18n/I18nProvider";

/** Shown on pages that are not translated yet when the UI language is not Finnish. */
export default function FinnishOnlyNote() {
    const { lang, t } = useI18n();
    if (lang === "fi") return null;
    return (
        <p style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', marginBottom: '24px' }}>
            {t("footer.finnishOnly")}
        </p>
    );
}
