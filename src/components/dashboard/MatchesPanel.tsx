"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, MapPin, Check, X, PartyPopper } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { bikeTitle } from "@/lib/bikes";
import ContactForm from "@/components/ContactForm";

interface MatchRow {
    match_id: number;
    score: number;
    reasons: string[];
    match_status: "uusi" | "vahvistettu" | "hylatty";
    created_at: string;
    my_role: "omistaja" | "löytäjä";
    my_bike_id: string;
    my_bike_label: string;
    other_bike_id: string;
    other_brand: string | null;
    other_model: string | null;
    other_type: string | null;
    other_color: string | null;
    other_city: string | null;
    other_location: string | null;
    other_image_url: string | null;
    other_description: string | null;
    other_event_date: string | null;
}

function confidence(score: number) {
    if (score >= 100) return { label: "Erittäin todennäköinen", color: "#2e7d32", bg: "#e8f5e9" };
    if (score >= 70) return { label: "Todennäköinen", color: "#e65100", bg: "#fff3e0" };
    return { label: "Mahdollinen", color: "#555", bg: "#f0f0f0" };
}

/**
 * Suggested matches between the user's stolen/registered bikes and found
 * reports (computed in the database by refresh_bike_matches()).
 */
export default function MatchesPanel({ onBikeRecovered }: { onBikeRecovered?: () => void }) {
    const [matches, setMatches] = useState<MatchRow[]>([]);
    const [loaded, setLoaded] = useState(false);

    const load = useCallback(async () => {
        const { data, error } = await supabase.rpc("my_matches");
        if (!error && data) setMatches(data as MatchRow[]);
        setLoaded(true);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
        load();
    }, [load]);

    const setStatus = async (id: number, status: "vahvistettu" | "hylatty") => {
        const { error } = await supabase.from("bike_matches").update({ status }).eq("id", id);
        if (!error) setMatches(ms => ms.map(m => (m.match_id === id ? { ...m, match_status: status } : m)));
    };

    const markRecovered = async (bikeId: string) => {
        const { error } = await supabase.from("bikes").update({ status: "löytynyt" }).eq("id", bikeId);
        if (!error) {
            await load();
            onBikeRecovered?.();
        }
    };

    const visible = matches.filter(m => m.match_status !== "hylatty");
    if (!loaded || visible.length === 0) return null;

    return (
        <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} color="var(--primary-dark)" /> Mahdolliset osumat ({visible.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                CycleFound vertaa ilmoituksiasi automaattisesti kaikkiin löytöilmoituksiin.
            </p>

            <div style={{ display: 'grid', gap: '20px' }}>
                {visible.map(m => {
                    const c = confidence(m.score);
                    const otherTitle = bikeTitle({ brand: m.other_brand, model: m.other_model });

                    if (m.my_role === "löytäjä") {
                        return (
                            <div key={m.match_id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
                                <p style={{ fontWeight: 700, marginBottom: '6px' }}>Löytämäsi pyörä ({m.my_bike_label}) vastaa ilmoitusta: {otherTitle}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                    Omistajalle on ilmoitettu. Hän ottaa sinuun yhteyttä CycleFoundin kautta – näet viestit alla.
                                </p>
                            </div>
                        );
                    }

                    return (
                        <div key={m.match_id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                            <div style={{ minHeight: '180px', backgroundColor: '#f0f0f0' }}>
                                {m.other_image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.other_image_url} alt={otherTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '11px', fontWeight: 700 }}>EI KUVAA</div>
                                )}
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    <span style={{ backgroundColor: c.bg, color: c.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{c.label}</span>
                                    {m.match_status === "vahvistettu" && (
                                        <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Vahvistettu</span>
                                    )}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pyöräsi: {m.my_bike_label}</p>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>Löydetty: {otherTitle}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                    <MapPin size={14} /> {m.other_location || m.other_city || "–"}
                                    {m.other_event_date && ` • ${new Date(m.other_event_date).toLocaleDateString('fi-FI')}`}
                                </p>
                                {m.other_description && <p style={{ fontSize: '14px', marginBottom: '12px', lineHeight: 1.5 }}>{m.other_description}</p>}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    {m.reasons.map(r => (
                                        <span key={r} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>✓ {r}</span>
                                    ))}
                                </div>

                                {m.match_status === "uusi" && (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button className="primary-button" onClick={() => setStatus(m.match_id, "vahvistettu")} style={{ padding: '10px 16px', fontSize: '14px' }}>
                                            <Check size={16} /> Tämä on minun pyöräni
                                        </button>
                                        <button onClick={() => setStatus(m.match_id, "hylatty")} style={{ padding: '10px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <X size={16} /> Ei ole minun
                                        </button>
                                    </div>
                                )}

                                {m.match_status === "vahvistettu" && (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                            <p style={{ fontWeight: 700, marginBottom: '12px' }}>Ota yhteyttä löytäjään</p>
                                            <ContactForm bikeId={m.other_bike_id} recipient="löytäjä" />
                                        </div>
                                        <button onClick={() => markRecovered(m.my_bike_id)} style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', backgroundColor: '#000', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <PartyPopper size={16} /> Sain pyörän takaisin – merkitse palautetuksi
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
