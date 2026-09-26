"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PublicStats {
    recovered: number;
    stolen_active: number;
    found_reports: number;
    registered: number;
    reported_today: number;
    matches: number;
    users: number;
}

const fmt = (n: number | undefined) => (n === undefined ? "–" : n.toLocaleString("fi-FI"));

export default function Stats() {
    const [stats, setStats] = useState<PublicStats | null>(null);

    useEffect(() => {
        supabase.rpc("public_stats").then(({ data, error }) => {
            if (!error && data) setStats(data as PublicStats);
        });
    }, []);

    const tiles = [
        { label: "PALAUTETTU OMISTAJALLE", value: fmt(stats?.recovered), color: "var(--primary)" },
        { label: "AKTIIVISET VARKAUSILMOITUKSET", value: fmt(stats?.stolen_active), color: "var(--secondary)" },
        { label: "LÖYTÖILMOITUKSET", value: fmt(stats?.found_reports), color: "#2979ff" },
        { label: "AUTOMAATTISET OSUMAT", value: fmt(stats?.matches), color: "var(--text)" }
    ];

    return (
        <section className="container" style={{ margin: '40px auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {tiles.map(tile => (
                    <div key={tile.label} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${tile.color}` }}>
                        <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{tile.value}</h3>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{tile.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
