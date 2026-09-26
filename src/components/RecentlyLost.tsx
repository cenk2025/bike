"use client";

import { useState, useEffect } from "react";
import { Bike as BikeIcon } from "lucide-react";
import BikeCard from "./BikeCard";
import { supabase } from "@/lib/supabase";
import type { PublicBike } from "@/lib/bikes";

const TABS: { label: string; match: (b: PublicBike) => boolean }[] = [
    { label: "Kaikki", match: () => true },
    { label: "Varastetut", match: b => b.status === "varastettu" },
    { label: "Löydetyt", match: b => b.status === "ilmoitettu" },
    { label: "Sähkö", match: b => b.type === "Sähkö" || b.type === "Sähköpotkulauta" },
    { label: "Moottoripyörät", match: b => b.type === "Moottoripyörä" || b.type === "Mopo" }
];

export default function RecentlyLost() {
    const [activeTab, setActiveTab] = useState("Kaikki");
    const [bikes, setBikes] = useState<PublicBike[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("bikes_public")
                .select("*")
                .in("status", ["varastettu", "ilmoitettu"])
                .order("created_at", { ascending: false })
                .limit(24);

            if (!error && data) setBikes(data as PublicBike[]);
            setLoading(false);
        })();
    }, []);

    if (loading) return null;

    const matcher = TABS.find(t => t.label === activeTab)?.match ?? (() => true);
    const visible = bikes.filter(matcher).slice(0, 9);

    return (
        <section className="container" style={{ margin: '60px auto' }}>
            <h2 className="section-title" style={{ marginBottom: '32px' }}>Viimeisimmät ilmoitukset</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                {TABS.map(({ label }) => (
                    <button
                        key={label}
                        onClick={() => setActiveTab(label)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '30px',
                            backgroundColor: activeTab === label ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === label ? '#000' : 'var(--text-muted)',
                            border: activeTab === label ? 'none' : '1px solid var(--border)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', border: '2px dashed var(--border)', background: 'transparent' }}>
                    <BikeIcon size={40} style={{ color: 'var(--border)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Ei ilmoituksia tässä kategoriassa.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {visible.map(bike => <BikeCard key={bike.id} bike={bike} />)}
                </div>
            )}
        </section>
    );
}
