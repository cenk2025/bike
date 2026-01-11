"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, User, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    CycleFound
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-only" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link href="/loydetyt" style={{ fontWeight: 500 }}>Löydetyt</Link>
                    <Link href="/tarinat" style={{ fontWeight: 500 }}>Menestystarinat</Link>

                    {user ? (
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                            <User size={18} /> {user?.user_metadata?.full_name || 'Dashboard'}
                        </Link>
                    ) : (
                        <>
                            <Link href="/kirjaudu" style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>Kirjaudu</Link>
                            <Link href="/liity" className="primary-button" style={{ padding: '8px 20px' }}>
                                Liity nyt
                            </Link>
                        </>
                    )}
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
                    <Link href="/loydetyt" onClick={toggleMenu} style={{ fontWeight: 600, fontSize: '18px' }}>Löydetyt</Link>
                    <Link href="/tarinat" onClick={toggleMenu} style={{ fontWeight: 600, fontSize: '18px' }}>Menestystarinat</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    {user ? (
                        <Link href="/dashboard" onClick={toggleMenu} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary-dark)', fontSize: '18px' }}>
                            <User size={20} /> {user?.user_metadata?.full_name || 'Dashboard'}
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Link href="/kirjaudu" onClick={toggleMenu} style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '18px' }}>Kirjaudu</Link>
                            <Link href="/liity" onClick={toggleMenu} className="primary-button" style={{ justifyContent: 'center', width: '100%', padding: '16px' }}>
                                Liity nyt
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
