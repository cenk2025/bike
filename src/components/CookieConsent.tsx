"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useI18n();

    useEffect(() => {
        // The footer's "Evästeasetukset" link re-opens the banner.
        const open = () => setIsVisible(true);
        window.addEventListener("open-cookie-settings", open);

        let timer: ReturnType<typeof setTimeout> | undefined;
        if (!localStorage.getItem("cookie-consent")) {
            timer = setTimeout(() => setIsVisible(true), 1500);
        }
        return () => {
            window.removeEventListener("open-cookie-settings", open);
            if (timer) clearTimeout(timer);
        };
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "all");
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem("cookie-consent", "essential");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div className="glass" style={{
                maxWidth: '800px',
                width: '100%',
                padding: '24px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                animation: 'slideUp 0.5s ease-out'
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                        backgroundColor: 'var(--primary)',
                        padding: '12px',
                        borderRadius: '16px',
                        color: '#000'
                    }}>
                        <Cookie size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{t("cookie.title")}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            {t("cookie.text")}{" "}
                            <a href="/tietosuoja#evasteet" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{t("cookie.readMore")}</a>.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={handleReject}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border)',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        {t("cookie.essential")}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="primary-button"
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '14px'
                        }}
                    >
                        {t("cookie.acceptAll")} <Check size={18} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
