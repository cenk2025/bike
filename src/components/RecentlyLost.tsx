"use client";

import { useState, useEffect } from "react";
import BikeCard from "./BikeCard";
import { supabase } from "@/lib/supabase";

export default function RecentlyLost() {
    const [activeTab, setActiveTab] = useState("Kaikki");
    const [bikes, setBikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const tabs = ["Kaikki", "Maastopyörä", "Maantie", "Sähkö"];

    useEffect(() => {
        const fetchRecentBikes = async () => {
            const { data, error } = await supabase
                .from('bikes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(6);

            if (!error && data) {
                // Map database schema to card expected props if necessary
                const mappedBikes = data.map(bike => ({
                    brand: bike.brand,
                    model: bike.model,
                    type: bike.type || "Pyörä",
                    location: bike.location,
                    time: formatRelativeTime(bike.created_at),
                    image: bike.image_url || "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800&auto=format&fit=crop",
                    status: bike.status.toUpperCase()
                }));
                setBikes(mappedBikes);
            }
            setLoading(false);
        };

        fetchRecentBikes();
    }, []);

    // Simple relative time formatter
    const formatRelativeTime = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return "Juuri nyt";
        if (diffInHours < 24) return `${diffInHours}h sitten`;
        return `${Math.floor(diffInHours / 24)}pv sitten`;
    };

    if (loading) return null;

    // Fallback if no bikes in DB yet (show mock data or empty state)
    const displayBikes = bikes.length > 0 ? bikes : [
        {
            brand: "Specialized",
            model: "Rockhopper",
            type: "Maastopyörä",
            location: "Helsinki, Kallio",
            time: "2h sitten",
            image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?q=80&w=800&auto=format&fit=crop",
            status: "VARASTETTU"
        },
        {
            brand: "Pelago",
            model: "San Sebastian",
            type: "Maantie",
            location: "Espoo, Tapiola",
            time: "5h sitten",
            image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800&auto=format&fit=crop",
            status: "ILMOITETTU"
        }
    ];

    return (
        <section className="container" style={{ margin: '60px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Viimeksi kadonneet</h2>
                <button style={{ color: 'var(--primary-dark)', fontWeight: 600, backgroundColor: 'transparent' }}>Näytä kartalla</button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '30px',
                            backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === tab ? '#000' : 'var(--text-muted)',
                            border: activeTab === tab ? 'none' : '1px solid var(--border)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {displayBikes.filter(bike => activeTab === "Kaikki" || bike.type === activeTab).map((bike, index) => (
                    <BikeCard key={index} {...bike} />
                ))}
            </div>
        </section>
    );
}
