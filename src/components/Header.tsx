"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, User, Menu, X } from "lucide-react";
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

        // Initial check
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '20px', color: 'var(--text)' }}>
                    <div style={{ backgroundColor: 'var(--primary)', padding: '6px', borderRadius: '8px', color: '#000', display: 'flex' }}>
                        <Bike size={24} />
                    </div>
                    BikeBack
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-only" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link href="/loydetyt" style={{ fontWeight: 500 }}>{t("nav.found")}</Link>
                    <Link href="/kartta" style={{ fontWeight: 500 }}>{t("nav.map")}</Link>
                    <Link href="/tarkista" style={{ fontWeight: 500 }}>{t("nav.check")}</Link>
                    <Link href="/tarinat" style={{ fontWeight: 500 }}>{t("nav.stories")}</Link>

                    {user ? (
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                            <User size={18} /> {user?.user_metadata?.full_name || t("nav.myPage")}
                        </Link>
                    ) : (
                        <>
                            <Link href="/kirjaudu" style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>{t("nav.login")}</Link>
                            <Link href="/liity" className="primary-button" style={{ padding: '8px 20px' }}>
                                {t("nav.join")}
                            </Link>
                        </>
                    )}
                    <LanguageSwitcher />
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-only"
                    onClick={toggleMenu}
                    style={{ background: 'transparent', color: 'var(--text)', padding: '8px' }}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div
                    className="mobile-nav-active"
                    style={{
                        position: 'absolute',
                        top: 'var(--header-height)',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--surface)',
                        borderBottom: '1px solid var(--border)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    <Link href="/loydetyt" onClick={toggleMenu} style={{ fontWeight: 600, fontSize: '18px' }}>{t("nav.found")}</Link>
                    <Link href="/kartta" onClick={toggleMenu} style={{ fontWeight: 600, fontSize: '18px' }}>{t("nav.map")}</Link>
                    <Link href="/tarkista" onClick={toggleMenu} style={{ fontWeight: 600, fontSize: '18px' }}>{t("nav.check")}</Link>
                    <Link href="/tarinat" onClick={toggleMenu} style={{ fontWeight: 600, fontSize: '18px' }}>{t("nav.stories")}</Link>
                    <LanguageSwitcher />
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    {user ? (
                        <Link href="/dashboard" onClick={toggleMenu} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary-dark)', fontSize: '18px' }}>
                            <User size={20} /> {user?.user_metadata?.full_name || t("nav.myPage")}
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Link href="/kirjaudu" onClick={toggleMenu} style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '18px' }}>{t("nav.login")}</Link>
                            <Link href="/liity" onClick={toggleMenu} className="primary-button" style={{ justifyContent: 'center', width: '100%', padding: '16px' }}>
                                {t("nav.join")}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
