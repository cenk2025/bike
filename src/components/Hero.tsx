"use client";

import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import Sticker from "./home/Sticker";
import BikeScene from "./home/BikeScene";

export default function Hero() {
    const { t } = useI18n();
    return (
        <>
            <section style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 48px) 16px 0', position: 'relative' }}>
                <h1 className="hero-title" style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                    BikeBack
                    <Sticker className="hero-sticker-a" shape="flower" color="mint" size="clamp(74px, 11vw, 140px)" rotate={-8} style={{ left: '-7%', top: '18%' }}>
                        {t("hero.sticker1")}
                    </Sticker>
                    <Sticker className="hero-sticker-b" shape="pill" color="pink" size="clamp(96px, 12vw, 170px)" rotate={-4} style={{ left: '50%', top: '22%' }}>
                        {t("hero.sticker2")}
                    </Sticker>
                    <Sticker className="hero-sticker-c" shape="burst" color="lavender" size="clamp(80px, 11vw, 150px)" rotate={-28} style={{ right: '-9%', top: '-2%' }}>
                        {t("hero.sticker3")}
                    </Sticker>
                </h1>

                <p className="display" style={{ fontSize: 'clamp(24px, 3.4vw, 40px)', fontWeight: 600, marginTop: '14px' }}>
                    {t("hero.tagline")}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: '560px', margin: '8px auto 0' }}>
                    {t("hero.subtitle")}
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
                    <Link href="/ilmoita-varkaudesta" className="primary-button" style={{ fontSize: '19px', padding: '14px 30px' }}>
                        <AlertTriangle size={20} /> {t("hero.reportTheft")}
                    </Link>
                    <Link href="/loydetyt" className="secondary-button" style={{ fontSize: '19px', padding: '14px 30px' }}>
                        <Search size={20} /> {t("hero.foundBike")}
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '8px 24px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px', fontSize: '15px', fontWeight: 600 }}>
                    <Link href="/ilmoita-varkaudesta?tila=rekisteroi" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>{t("hero.register")}</Link>
                    <Link href="/tarkista" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>{t("hero.check")}</Link>
                </div>
            </section>

            <div className="rings">
                <div className="scene-circle">
                    <BikeScene foundLabel={t("hero.found")} title={t("hero.sceneAlt")} />
                </div>
            </div>
            <div className="scallops" aria-hidden="true" />
        </>
    );
}
