"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { ShieldAlert, QrCode, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { bikeTitle } from "@/lib/bikes";

interface TaggedBike {
    id: string;
    brand: string | null;
    model: string | null;
    type: string | null;
    color: string | null;
    status: string;
    image_url: string | null;
}

/**
 * Landing page of a CycleFound QR sticker (bike.voon.fi/q/<code>).
 * The finder can message the owner without an account – the owner's
 * contact details are never shown.
 */
export default function TagPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const [bike, setBike] = useState<TaggedBike | null | undefined>(undefined);

    useEffect(() => {
        supabase.rpc("bike_by_tag", { p_code: code }).then(({ data, error }) => {
            setBike(!error && data && data.length > 0 ? (data[0] as TaggedBike) : null);
        });
    }, [code]);

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />
            <div className="container" style={{ maxWidth: '560px', padding: '48px 24px 80px' }}>
                {bike === undefined ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Haetaan…</p>
                ) : bike === null ? (
                    <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                        <QrCode size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Tunnistetta ei löytynyt</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                            Koodia <strong>{code.toUpperCase()}</strong> ei ole rekisteröity. Jos löysit pyörän, tee löytöilmoitus –
                            vertaamme sen automaattisesti kaikkiin varkausilmoituksiin.
                        </p>
                        <Link href="/loydetyt" className="primary-button">Tee löytöilmoitus</Link>
                    </div>
                ) : (
                    <>
                        <p style={{ color: 'var(--primary-dark)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            CYCLEFOUND-TUNNISTE {code.toUpperCase()}
                        </p>
                        <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '12px' }}>
                            {bike.status === 'löytynyt' ? 'Tämä pyörä on jo palautettu omistajalleen' : 'Löysitkö tämän pyörän?'}
                        </h1>

                        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
                            {bike.image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={bike.image_url} alt={bikeTitle(bike)} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: '20px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{bikeTitle(bike)}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>{[bike.type, bike.color].filter(Boolean).join(' • ')}</p>
                            </div>
                        </div>

                        {bike.status === 'varastettu' && (
                            <div style={{ backgroundColor: '#fff5f5', borderLeft: '5px solid #dc2626', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                                <p style={{ fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <ShieldAlert size={20} /> Pyörä on ilmoitettu varastetuksi
                                </p>
                                <p style={{ lineHeight: 1.6 }}>
                                    Jos pyörä on jonkun muun hallussa juuri nyt, älä puutu tilanteeseen itse – soita 112.
                                    Lähetä myös viesti omistajalle alla.
                                </p>
                            </div>
                        )}

                        {bike.status !== 'löytynyt' ? (
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>Lähetä viesti omistajalle</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                                    Kerro, missä pyörä on. Omistaja saa viestin heti – et tarvitse käyttäjätiliä,
                                    eikä kenenkään yhteystietoja näytetä julkisesti.
                                </p>
                                <ContactForm bikeId={bike.id} recipient="omistaja" />
                            </div>
                        ) : (
                            <p style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#2e7d32', fontWeight: 600 }}>
                                <CheckCircle2 size={20} /> Kiitos, että tarkistit!
                            </p>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
