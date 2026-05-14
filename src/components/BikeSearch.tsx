"use client";

import { useEffect, useState } from "react";
import { Search, X, Bike as BikeIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BikeCard from "./BikeCard";

interface SearchResult {
    id: string;
    brand: string;
    model: string;
    type: string | null;
    location: string;
    image_url: string | null;
    status: string;
    created_at: string;
    description: string | null;
    allow_contact: boolean | null;
    contact_email: string | null;
    contact_phone: string | null;
}

// Same helper RecentlyLost uses. Kept local for now; if a third caller appears
// we should lift it to src/lib/time.ts and dedupe.
const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffH = Math.floor((now.getTime() - past.getTime()) / 3_600_000);
    if (diffH < 1) return "Juuri nyt";
    if (diffH < 24) return `${diffH}h sitten`;
    return `${Math.floor(diffH / 24)}pv sitten`;
};

/**
 * Live, debounced search over the bikes table. Matches against:
 *   - serial_number
 *   - brand
 *   - model
 *   - location (city / address)
 *
 * The four columns are OR'd together in a single PostgREST query so the user
 * does not need to pick which field to search — they just type.
 */
export default function BikeSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query.trim();
        // Don't fire on every keystroke — wait until the user has typed at
        // least two characters and paused for 300ms.
        if (q.length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        const handle = setTimeout(async () => {
            setLoading(true);
            // PostgREST's or() filter uses comma/parentheses as syntax — strip
            // anything that could break it out of the user's query.
            const safe = q.replace(/[,()'"%\\]/g, "").trim();
            if (!safe) {
                setResults([]);
                setLoading(false);
                return;
            }
            const pattern = `%${safe}%`;
            const { data, error } = await supabase
                .from("bikes")
                .select("*")
                .or(
                    `serial_number.ilike.${pattern},brand.ilike.${pattern},` +
                    `model.ilike.${pattern},location.ilike.${pattern}`
                )
                .order("created_at", { ascending: false })
                .limit(24);

            if (!error) setResults(data ?? []);
            else setResults([]);
            setLoading(false);
        }, 300);

        return () => clearTimeout(handle);
    }, [query]);

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
                    placeholder="Etsi sarjanumerolla, merkillä, mallilla tai kaupungilla…"
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
            {results !== null && (
                <div style={{ marginTop: '24px' }}>
                    {loading ? (
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
                                    <BikeCard
                                        key={bike.id}
                                        brand={bike.brand}
                                        model={bike.model}
                                        type={bike.type || "Pyörä"}
                                        location={bike.location}
                                        time={formatRelativeTime(bike.created_at)}
                                        image={bike.image_url}
                                        status={bike.status.toUpperCase()}
                                        description={bike.description || undefined}
                                        allow_contact={bike.allow_contact ?? false}
                                        contact_email={bike.contact_email ?? undefined}
                                        contact_phone={bike.contact_phone ?? undefined}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
