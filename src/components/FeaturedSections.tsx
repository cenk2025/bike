"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, Handshake, Users, TrendingUp, Bike, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdSlot } from "@/lib/admin";

// Hard-coded copy that ships with the app. Whatever exists in the `ad_slots`
// table replaces these fields slot-by-slot, but the homepage stays usable even
// if the table is empty / the query fails / Supabase is unreachable.
const FALLBACKS: Record<string, AdSlot> = {
    insurance: {
        slug: "insurance",
        eyebrow: "Mielenrauha",
        title: "Mainosmahdollisuudet vakuutusyhtiöille",
        description:
            "CycleFound auttaa pyöräilijöitä saamaan pyöränsä takaisin — ja vakuutusyhtiöitä " +
            "vähentämään korvauskuluja. Etsimme kumppaneita rakentamaan turvallisempaa " +
            "pyöräily-Suomea yhdessä.",
        image_url: null,
        cta_label: "Ota yhteyttä kumppanuudesta",
        cta_href: "mailto:info@voon.fi?subject=Mainoskumppanuus%20%E2%80%93%20vakuutusyhti%C3%B6",
        is_active: true,
        updated_at: ""
    },
    premium: {
        slug: "premium",
        eyebrow: "PREMIUM-MAINOSPAIKKA — VAPAA",
        title: "Bränditila pyörä- ja moottoripyöräyhtiöille",
        description:
            "Premium-sijoittelu CycleFoundin etusivulla. Tavoita ostohaluiset pyöräilijät " +
            "juuri silloin, kun he tutkivat pyöriinsä liittyviä palveluita.",
        image_url: null,
        cta_label: "Varaa mainospaikka",
        cta_href: "mailto:info@voon.fi?subject=Premium-mainospaikka%20%E2%80%93%20py%C3%B6r%C3%A4-%2Fmoottoripy%C3%B6r%C3%A4yhti%C3%B6",
        is_active: true,
        updated_at: ""
    }
};

export default function FeaturedSections() {
    const [slots, setSlots] = useState<Record<string, AdSlot>>(FALLBACKS);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
                .from("ad_slots")
                .select("*")
                .eq("is_active", true)
                .in("slug", ["insurance", "premium"]);
            if (cancelled || error || !data) return;
            const merged: Record<string, AdSlot> = { ...FALLBACKS };
            for (const row of data as AdSlot[]) {
                merged[row.slug] = { ...FALLBACKS[row.slug], ...row };
            }
            setSlots(merged);
        })();
        return () => { cancelled = true; };
    }, []);

    const insurance = slots.insurance;
    const premium = slots.premium;

    return (
        <section className="container" style={{ margin: '60px auto', display: 'grid', gap: '32px' }}>
            {/* ── Insurance Partnership Opportunities ── */}
            <div style={{ backgroundColor: '#e8f5e9', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--primary)', color: '#000', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{insurance.eyebrow || 'Mielenrauha'}</h3>
                </div>

                {insurance.description && (
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', whiteSpace: 'pre-line' }}>
                        {insurance.description}
                    </p>
                )}

                {/* If an admin uploaded a banner image, show it above the CTA card. */}
                {insurance.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={insurance.image_url}
                        alt={insurance.title}
                        style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '16px' }}
                    />
                )}

                {/* Partnership CTA card */}
                <div className="card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '28px',
                    backgroundColor: '#fff',
                    border: '2px dashed var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'var(--primary)',
                            color: '#000',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Handshake size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{insurance.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Tavoita Suomen aktiivisin pyöräilijäkohderyhmä.
                            </p>
                        </div>
                    </div>

                    {/* Audience stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '16px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} style={{ color: 'var(--primary-dark)' }} />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kohderyhmä</p>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>Pyörän omistajat</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={20} style={{ color: 'var(--primary-dark)' }} />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Konteksti</p>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>Korkea ostoaikomus</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={20} style={{ color: 'var(--primary-dark)' }} />
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sijoittelu</p>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>Premium-näkyvyys</p>
                            </div>
                        </div>
                    </div>

                    {insurance.cta_href && insurance.cta_label && (
                        <a
                            href={insurance.cta_href}
                            className="primary-button"
                            style={{ alignSelf: 'flex-start', borderRadius: '12px', textDecoration: 'none' }}
                        >
                            {insurance.cta_label} <ArrowRight size={18} />
                        </a>
                    )}
                </div>
            </div>

            {/* ── Premium Advertising Slot ── */}
            <div style={{ backgroundColor: '#121212', borderRadius: '24px', padding: '40px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                    {premium.eyebrow && (
                        <p style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={14} /> {premium.eyebrow}
                        </p>
                    )}
                    <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
                        {premium.title}
                    </h3>
                    {premium.description && (
                        <p style={{ color: '#aaa', marginBottom: '24px', whiteSpace: 'pre-line' }}>
                            {premium.description}
                        </p>
                    )}

                    {/* Admin-uploaded ad image (e.g. a brand creative). */}
                    {premium.image_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={premium.image_url}
                            alt={premium.title}
                            style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '16px', marginBottom: '24px' }}
                        />
                    )}

                    {/* Inclusions */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                        marginBottom: '28px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sisältyy</p>
                                <p style={{ fontSize: '14px', fontWeight: 600 }}>Etusivun banneri</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <Bike size={18} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kohderyhmä</p>
                                <p style={{ fontSize: '14px', fontWeight: 600 }}>Pyöräilijät & ajajat</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tulosseuranta</p>
                                <p style={{ fontSize: '14px', fontWeight: 600 }}>Klikit & näytöt</p>
                            </div>
                        </div>
                    </div>

                    {premium.cta_href && premium.cta_label && (
                        <a
                            href={premium.cta_href}
                            className="primary-button"
                            style={{ backgroundColor: 'var(--primary)', color: '#000', textDecoration: 'none' }}
                        >
                            {premium.cta_label} <ArrowRight size={18} />
                        </a>
                    )}
                </div>
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: 0.08,
                    transform: 'rotate(-15deg)',
                    pointerEvents: 'none'
                }}>
                    <Bike size={200} />
                </div>
            </div>
        </section>
    );
}
