"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, User, X, ArrowUpRight } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = useI18n();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isMenuOpen]);

    const close = () => setIsMenuOpen(false);
    const links = [
        { href: "/ilmoita-varkaudesta", label: t("hero.reportTheft") },
        { href: "/loydetyt", label: t("nav.found") },
        { href: "/kartta", label: t("nav.map") },
        { href: "/tarkista", label: t("nav.check") },
        { href: "/tarinat", label: t("nav.stories") }
    ];

    return (
        <header className="site-header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)' }}>
                    <span style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--yellow)', border: '2px solid var(--maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bike size={22} />
                    </span>
                    <span style={{ lineHeight: 1.1 }}>
                        <span style={{ display: 'block', fontWeight: 700, fontSize: '18px' }}>BikeBack</span>
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t("nav.tagline")}</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="desktop-only"><LanguageSwitcher /></span>
                    <button
                        type="button"
                        className="menu-pill"
                        onClick={() => setIsMenuOpen(o => !o)}
                        aria-expanded={isMenuOpen}
                        aria-controls="site-menu"
                    >
                        {isMenuOpen ? <X size={20} /> : t("nav.menu")}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <>
                    <div onClick={close} style={{ position: 'fixed', inset: 0, top: 'var(--header-height)', backgroundColor: 'rgba(58, 11, 28, 0.25)', zIndex: 1 }} />
                    <nav id="site-menu" className="menu-panel">
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {links.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} onClick={close} className="menu-link">
                                        {link.label} <ArrowUpRight size={22} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <hr style={{ border: 'none', borderTop: '1.5px solid var(--border)', margin: '16px 0' }} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                            {user ? (
                                <Link href="/dashboard" onClick={close} className="primary-button">
                                    <User size={18} /> {user.user_metadata?.full_name || t("nav.myPage")}
                                </Link>
                            ) : (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Link href="/liity" onClick={close} className="primary-button">{t("nav.join")}</Link>
                                    <Link href="/kirjaudu" onClick={close} style={{ fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '4px' }}>{t("nav.login")}</Link>
                                </div>
                            )}
                            <LanguageSwitcher />
                        </div>
                    </nav>
                </>
            )}
        </header>
    );
}
