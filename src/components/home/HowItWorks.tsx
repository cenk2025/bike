"use client";

import { ShieldCheck, Sparkles, MessageCircleHeart } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import Sticker from "./Sticker";

const STEPS = [
    { icon: ShieldCheck, color: "var(--mint)", title: "home.step1Title", text: "home.step1Text" },
    { icon: Sparkles, color: "var(--yellow)", title: "home.step2Title", text: "home.step2Text" },
    { icon: MessageCircleHeart, color: "var(--pink)", title: "home.step3Title", text: "home.step3Text" }
] as const;

export default function HowItWorks() {
    const { t } = useI18n();
    return (
        <section className="container" style={{ padding: '40px 24px 20px', textAlign: 'center' }}>
            <h2 className="display" style={{ position: 'relative', display: 'inline-block', fontSize: 'clamp(64px, 11vw, 150px)', fontWeight: 700, lineHeight: 0.9, maxWidth: '900px' }}>
                {t("home.bigTitle")}
                <Sticker shape="wavy" color="lavender" size="clamp(80px, 10vw, 130px)" rotate={-18} style={{ left: '14%', bottom: '-10%' }}>
                    {t("home.bigSticker")}
                </Sticker>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '56px', textAlign: 'left' }}>
                {STEPS.map(({ icon: Icon, color, title, text }, i) => (
                    <div key={title} className="card" style={{ padding: '28px', borderColor: 'var(--maroon)', borderWidth: '2px', boxShadow: '0 6px 0 var(--maroon)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <span style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--maroon)' }}>
                                <Icon size={22} />
                            </span>
                            <span className="display" style={{ fontSize: '40px', fontWeight: 700, opacity: 0.25 }}>0{i + 1}</span>
                        </div>
                        <h3 className="display" style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>{t(title)}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{t(text)}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
