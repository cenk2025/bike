"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Header() {
    const [user, setUser] = useState<any>(null);

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

                <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
            </div>
        </header>
    );
}
