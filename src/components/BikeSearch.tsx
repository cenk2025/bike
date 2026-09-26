"use client";

import { useEffect, useState } from "react";
import { Search, X, Bike as BikeIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PublicBike } from "@/lib/bikes";
import BikeCard from "./BikeCard";

/**
 * Live, debounced search over public bike reports (`search_bikes` RPC).
 * Matches brand, model, colour, city and location by substring, and a serial
 * number only when the whole serial is typed – partial serials are not
 * searchable so they can't be enumerated.
 */
export default function BikeSearch() {
    const [query, setQuery] = useState("");
    // Results are stored together with the query they belong to, so stale
    // results are never shown for a newer query.
    const [result, setResult] = useState<{ q: string; bikes: PublicBike[] } | null>(null);

    const q = query.trim();
    const active = q.length >= 2;
    const results = active && result?.q === q ? result.bikes : null;
    const loading = active && result?.q !== q;

    useEffect(() => {
        // Don't fire on every keystroke — wait until the user has typed at
        // least two characters and paused for 300ms.
        if (q.length < 2) return;

        let cancelled = false;
        const handle = setTimeout(async () => {
            const { data, error } = await supabase.rpc("search_bikes", { q, max_results: 24 });
            if (!cancelled) setResult({ q, bikes: !error && data ? (data as PublicBike[]) : [] });
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [q]);

    return (
        <section className="container" style={{ margin: '32px auto' }}>
            <label
                htmlFor="bike-search"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '18px 20px',
                    border: '1px solid var(--border)',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}
            >
                <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                    id="bike-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Etsi merkillä, mallilla, värillä, kaupungilla tai koko sarjanumerolla…"
                    aria-label="Etsi pyöriä"
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '16px',
                        padding: '4px 0',
                        minWidth: 0
                    }}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Tyhjennä haku"
                        style={{ color: 'var(--text-muted)', background: 'transparent', padding: '4px', display: 'flex' }}
                    >
                        <X size={18} />
                    </button>
                )}
            </label>

            {/* Status row — only when a query is in flight or returned. */}
            {active && (
                <div style={{ marginTop: '24px' }}>
                    {loading || results === null ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                            Etsitään…
                        </p>
                    ) : results.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', border: '2px dashed var(--border)', background: 'transparent' }}>
                            <BikeIcon size={40} style={{ color: 'var(--border)', marginBottom: '12px' }} />
                            <p style={{ color: 'var(--text)' }}>
                                Haulla <strong>&ldquo;{query}&rdquo;</strong> ei löytynyt pyöriä.
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Kokeile toista merkkiä, kaupunkia tai osaa sarjanumerosta.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Hakutulokset: <strong>{results.length}</strong> pyörää
                                {results.length === 24 ? ' (ensimmäiset 24)' : ''}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {results.map(bike => (
                                    <BikeCard key={bike.id} bike={bike} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
