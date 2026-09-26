"use client";

import { AlertTriangle, Search } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function Hero() {
    const { t } = useI18n();
    return (
        <section style={{
            padding: '60px 0',
            background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat',
            borderRadius: '24px',
            margin: '20px',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            textAlign: 'center'
        }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1 }}>
                    {t("hero.title")}
                </h1>
                <p style={{ fontSize: '18px', marginBottom: '40px', color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                    {t("hero.subtitle")}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
                    <Link href="/ilmoita-varkaudesta" className="secondary-button" style={{
                        height: '140px',
                        borderRadius: '20px',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        fontSize: '18px',
                        backgroundColor: 'var(--secondary)'
                    }}>
                        <AlertTriangle size={32} />
                        {t("hero.reportTheft")}
                    </Link>

                    <Link href="/loydetyt" className="primary-button" style={{
                        height: '140px',
                        borderRadius: '20px',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        fontSize: '18px',
                        backgroundColor: 'var(--primary)'
                    }}>
                        <Search size={32} />
                        {t("hero.foundBike")}
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '12px 28px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px', fontSize: '15px' }}>
                    <Link href="/ilmoita-varkaudesta?tila=rekisteroi" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                        {t("hero.register")}
                    </Link>
                    <Link href="/tarkista" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                        {t("hero.check")}
                    </Link>
                </div>
            </div>
        </section>
    );
}
