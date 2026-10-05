"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BikeCard from "@/components/BikeCard";
import { supabase } from "@/lib/supabase";
import { cityCoords, type PublicBike } from "@/lib/bikes";
import { useI18n } from "@/i18n/I18nProvider";

type Filter = "kaikki" | "varastettu" | "ilmoitettu";

interface CityGroup {
    city: string;
    coords: [number, number];
    stolen: PublicBike[];
    found: PublicBike[];
}

const FINLAND_CENTER: [number, number] = [63.5, 25.5];

/**
 * Map of active stolen and found reports, grouped per city (reports only
 * store a city + free-text place, never exact coordinates).
 */
export default function MapPage() {
    const [bikes, setBikes] = useState<PublicBike[]>([]);
    const [filter, setFilter] = useState<Filter>("kaikki");
    const [selected, setSelected] = useState<string | null>(null);
    const mapEl = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const layerRef = useRef<LayerGroup | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const { t } = useI18n();

    useEffect(() => {
        supabase
            .from("bikes_public")
            .select("*")
            .in("status", ["varastettu", "ilmoitettu"])
            .order("created_at", { ascending: false })
            .limit(1000)
            .then(({ data, error }) => {
                if (!error && data) setBikes(data as PublicBike[]);
            });
    }, []);

    const { groups, unlocated } = useMemo(() => {
        const byCity = new Map<string, CityGroup>();
        let unlocated = 0;
        for (const bike of bikes) {
            if (filter !== "kaikki" && bike.status !== filter) continue;
            const coords = cityCoords(bike.city);
            if (!coords || !bike.city) {
                unlocated++;
                continue;
            }
            const key = bike.city.trim().toLowerCase();
            const group = byCity.get(key) ?? { city: bike.city.trim(), coords, stolen: [], found: [] };
            (bike.status === "varastettu" ? group.stolen : group.found).push(bike);
            byCity.set(key, group);
        }
        return { groups: [...byCity.values()], unlocated };
    }, [bikes, filter]);

    // Create the map once (Leaflet needs `window`, so it is imported lazily).
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const L = (await import("leaflet")).default;
            if (cancelled || !mapEl.current || mapRef.current) return;
            const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView(FINLAND_CENTER, 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            mapRef.current = map;
            layerRef.current = L.layerGroup().addTo(map);
            setMapReady(true);
        })();
        return () => {
            cancelled = true;
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);
    // Redraw markers whenever the data or filter changes.
    useEffect(() => {
        if (!mapReady || !layerRef.current) return;
        (async () => {
            const L = (await import("leaflet")).default;
            const layer = layerRef.current!;
            layer.clearLayers();
            for (const g of groups) {
                const total = g.stolen.length + g.found.length;
                const color = g.stolen.length >= g.found.length ? "#ff1744" : "#00c853";
                L.circleMarker(g.coords, {
                    radius: Math.min(10 + Math.sqrt(total) * 5, 36),
                    color: "#fff",
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.85
                })
                    .bindTooltip(`<strong>${g.city}</strong><br>${t("map.tooltip", { stolen: g.stolen.length, found: g.found.length })}`)
                    .on("click", () => setSelected(g.city.toLowerCase()))
                    .addTo(layer);
            }
        })();
    }, [groups, mapReady, t]);

    const selectedGroup = groups.find(g => g.city.toLowerCase() === selected);
    const selectedBikes = selectedGroup ? [...selectedGroup.stolen, ...selectedGroup.found] : [];

    return (
        <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
            <Header />
            <div className="container" style={{ padding: '40px 24px 60px' }}>
                <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginBottom: '8px' }}>{t("map.title")}</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                    {t("map.intro")}
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {([["kaikki", "recent.all"], ["varastettu", "recent.stolen"], ["ilmoitettu", "recent.found"]] as const).map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            style={{
                                padding: '8px 20px', borderRadius: '30px', fontWeight: 600,
                                backgroundColor: filter === value ? 'var(--primary)' : 'var(--surface)',
                                border: filter === value ? 'none' : '1px solid var(--border)'
                            }}
                        >
                            {t(label)}
                        </button>
                    ))}
                </div>

                <div ref={mapEl} style={{ height: 'min(70vh, 560px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', zIndex: 0, position: 'relative' }} />

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff1744', marginRight: '6px' }} />{t("map.legendStolen")}</span>
                    <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00c853', marginRight: '6px' }} />{t("map.legendFound")}</span>
                    {unlocated > 0 && <span>{t("map.unlocated", { n: unlocated })}</span>}
                </div>

                {selectedGroup && (
                    <section style={{ marginTop: '40px' }}>
                        <h2 className="section-title">{selectedGroup.city} ({selectedBikes.length})</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {selectedBikes.map(bike => <BikeCard key={bike.id} bike={bike} />)}
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </main>
    );
}
