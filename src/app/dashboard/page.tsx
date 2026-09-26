"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus, Trash2, Edit2, Bike, BookOpen, Send, X, Shield, CheckCircle, AlertTriangle, PartyPopper, QrCode } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/lib/admin";
import { bikeTitle, statusStyle } from "@/lib/bikes";
import MatchesPanel from "@/components/dashboard/MatchesPanel";
import MessagesPanel from "@/components/dashboard/MessagesPanel";
import PushToggle from "@/components/dashboard/PushToggle";

interface BikeData {
    id: string;
    brand: string;
    model: string;
    serial_number: string | null;
    status: string;
    location: string;
    created_at: string;
    image_url: string | null;
    images: string[] | null;
}

interface StoryData {
    id: string;
    full_name: string;
    location: string;
    content: string;
    approved: boolean;
    created_at: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [bikes, setBikes] = useState<BikeData[]>([]);
    const [stories, setStories] = useState<StoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useIsAdmin();

    // Story form state
    const [showStoryForm, setShowStoryForm] = useState(false);
    const [storyForm, setStoryForm] = useState({ full_name: "", location: "", content: "" });
    const [storySubmitting, setStorySubmitting] = useState(false);
    const [storySuccess, setStorySuccess] = useState(false);

    const router = useRouter();

    // Declared before the effect so they can be referenced safely; wrapped in
    // useCallback to keep stable identity for the effect's dependency array.
    const fetchBikes = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('bikes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBikes(data);
        }
        setLoading(false);
    }, []);

    const fetchStories = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setStories(data);
        }
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/kirjaudu");
            } else {
                setUser(user);
                // Pre-fill name from user metadata
                setStoryForm(f => ({
                    ...f,
                    full_name: (user.user_metadata?.full_name as string) || ""
                }));
                fetchBikes(user.id);
                fetchStories(user.id);
            }
        };
        checkUser();
    }, [router, fetchBikes, fetchStories]);

    const handleDelete = async (id: string) => {
        if (confirm("Haluatko varmasti poistaa tämän ilmoituksen?")) {
            const { error } = await supabase.from('bikes').delete().eq('id', id);
            if (!error) {
                setBikes(bikes.filter(b => b.id !== id));
            }
        }
    };

    const setBikeStatus = async (id: string, status: "löytynyt" | "varastettu") => {
        const patch = status === "varastettu"
            ? { status, event_date: new Date().toISOString().slice(0, 10) }
            : { status };
        const { error } = await supabase.from('bikes').update(patch).eq('id', id);
        if (error) {
            alert("Tilan päivitys epäonnistui: " + error.message);
            return;
        }
        if (status === "varastettu") {
            // Let the owner add the theft location and police report number.
            router.push(`/dashboard/muokkaa/${id}`);
        } else if (user) {
            fetchBikes(user.id);
        }
    };

    const handleDeleteStory = async (id: string) => {
        if (confirm("Haluatko varmasti poistaa tämän tarinan?")) {
            const { error } = await supabase.from('stories').delete().eq('id', id);
            if (!error) {
                setStories(stories.filter(s => s.id !== id));
            }
        }
    };

    const handleStorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storyForm.full_name || !storyForm.location || !storyForm.content) return;
        setStorySubmitting(true);

        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from('stories').insert({
            user_id: userData.user!.id,
            full_name: storyForm.full_name,
            location: storyForm.location,
            content: storyForm.content,
            approved: true,
        });

        if (!error) {
            setStorySuccess(true);
            setStoryForm(f => ({ ...f, location: "", content: "" }));
            setShowStoryForm(false);
            fetchStories(userData.user!.id);
            setTimeout(() => setStorySuccess(false), 4000);
        }
        setStorySubmitting(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', fontWeight: 700 }}>Ladataan...</div>;
    }

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ padding: '60px 24px' }}>
                {/* Top header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Hei, {user?.user_metadata?.full_name || 'Käyttäjä'}!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Täällä voit hallinnoida pyöriäsi ja ilmoituksiasi.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {isAdmin && (
                            <Link
                                href="/dashboard/admin"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    backgroundColor: '#000',
                                    color: 'var(--primary)',
                                    fontWeight: 700,
                                    textDecoration: 'none'
                                }}
                                title="Vain ylläpitäjille"
                            >
                                <Shield size={18} /> Admin
                            </Link>
                        )}
                        <Link href="/ilmoita-varkaudesta?tila=rekisteroi" className="primary-button" style={{ borderRadius: '12px' }}>
                            <Plus size={20} /> Rekisteröi pyörä
                        </Link>
                        <Link href="/ilmoita-varkaudesta" className="secondary-button" style={{ borderRadius: '12px', backgroundColor: 'var(--secondary)' }}>
                            <AlertTriangle size={20} /> Ilmoita varkaus
                        </Link>
                        <button onClick={handleLogout} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 600, backgroundColor: '#fff' }}>
                            Kirjaudu ulos
                        </button>
                    </div>
                </div>

                <PushToggle />

                {user && <MatchesPanel onBikeRecovered={() => fetchBikes(user.id)} />}

                {/* ── Bikes section ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Omat pyörät ({bikes.length})</h2>

                    {bikes.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', background: 'transparent' }}>
                            <Bike size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Sinulla ei ole vielä tallennettuja pyöriä.</p>
                            <Link href="/ilmoita-varkaudesta" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>Tee ensimmäinen ilmoitus tästä</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {bikes.map((bike) => (
                                <div key={bike.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                    {/* Bike image */}
                                    <div style={{ height: '160px', backgroundColor: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
                                        {bike.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={bike.image_url}
                                                alt={`${bike.brand} ${bike.model}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#bbb' }}>
                                                <Bike size={40} />
                                                <span style={{ fontSize: '11px', fontWeight: 700 }}>EI KUVAA</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <div style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                backgroundColor: statusStyle(bike.status).bg,
                                                color: statusStyle(bike.status).fg,
                                                textTransform: 'uppercase'
                                            }}>
                                                {statusStyle(bike.status).label}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button aria-label="Muokkaa" style={{ color: 'var(--text-muted)' }} onClick={() => router.push(`/dashboard/muokkaa/${bike.id}`)}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button aria-label="Poista" style={{ color: '#dc2626' }} onClick={() => handleDelete(bike.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{bikeTitle(bike)}</h3>
                                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>SN: {bike.serial_number || '–'}</p>

                                        {bike.status === 'varastettu' && (
                                            <button onClick={() => setBikeStatus(bike.id, 'löytynyt')} style={{ width: '100%', marginBottom: '16px', padding: '10px', borderRadius: '10px', backgroundColor: '#000', color: '#fff', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <PartyPopper size={16} /> Sain pyörän takaisin
                                            </button>
                                        )}
                                        {bike.status === 'rekisteröity' && (
                                            <button onClick={() => confirm('Ilmoitetaanko pyörä varastetuksi? Ilmoitus tulee julkiseksi.') && setBikeStatus(bike.id, 'varastettu')} style={{ width: '100%', marginBottom: '16px', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--secondary)', color: '#fff', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <AlertTriangle size={16} /> Pyöräni on varastettu
                                            </button>
                                        )}

                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Lisätty: {new Date(bike.created_at).toLocaleDateString('fi-FI')}
                                            </span>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                {bike.status !== 'ilmoitettu' && (
                                                    <Link href={`/dashboard/tarra/${bike.id}`} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <QrCode size={14} /> QR-tarra
                                                    </Link>
                                                )}
                                                <Link href={`/dashboard/muokkaa/${bike.id}`} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                                                    Tiedot
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {user && <MessagesPanel userId={user.id} />}

                {/* ── Stories section ── */}
                <div id="tarinat" style={{ borderTop: '2px solid var(--border)', paddingTop: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BookOpen size={22} color="var(--primary-dark)" />
                                Tarinat ({stories.length})
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                                Jaa oma tarinasi siitä, miten sait pyöräsi takaisin!
                            </p>
                        </div>
                        <button
                            onClick={() => setShowStoryForm(!showStoryForm)}
                            className="primary-button"
                            style={{ borderRadius: '12px' }}
                        >
                            {showStoryForm ? <><X size={18} /> Sulje</> : <><Plus size={18} /> Kirjoita tarina</>}
                        </button>
                    </div>

                    {/* Success banner */}
                    {storySuccess && (
                        <div style={{
                            backgroundColor: '#e8f5e9',
                            border: '1px solid #4caf50',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#2e7d32',
                            fontWeight: 600
                        }}>
                            <CheckCircle size={20} /> Tarinasi on julkaistu! Se näkyy nyt Tarinat-sivulla.
                        </div>
                    )}

                    {/* Story form */}
                    {showStoryForm && (
                        <div className="card" style={{ marginBottom: '32px', padding: '32px', borderLeft: '4px solid var(--primary)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>✍️ Uusi tarina</h3>
                            <form onSubmit={handleStorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Nimi *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Esim. Heikki H."
                                            value={storyForm.full_name}
                                            onChange={e => setStoryForm(f => ({ ...f, full_name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Kaupunki *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Esim. Helsinki"
                                            value={storyForm.location}
                                            onChange={e => setStoryForm(f => ({ ...f, location: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Tarinasi *</label>
                                    <textarea
                                        className="input"
                                        placeholder="Kerro miten löysit pyöräsi takaisin..."
                                        value={storyForm.content}
                                        onChange={e => setStoryForm(f => ({ ...f, content: e.target.value }))}
                                        required
                                        rows={5}
                                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={storySubmitting}
                                        style={{ borderRadius: '12px' }}
                                    >
                                        <Send size={18} />
                                        {storySubmitting ? 'Julkaistaan...' : 'Julkaise tarina'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowStoryForm(false)}
                                        style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 600, backgroundColor: '#fff' }}
                                    >
                                        Peruuta
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Stories list */}
                    {stories.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '48px', border: '2px dashed var(--border)', background: 'transparent' }}>
                            <BookOpen size={40} style={{ color: 'var(--border)', marginBottom: '12px' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Et ole vielä jakanut yhtään tarinaa.</p>
                            <button
                                onClick={() => setShowStoryForm(true)}
                                style={{ color: 'var(--primary-dark)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Kirjoita ensimmäinen tarinasi →
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {stories.map((story) => (
                                <div key={story.id} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 700 }}>{story.full_name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>— {story.location}</span>
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '2px 10px',
                                                borderRadius: '20px',
                                                backgroundColor: story.approved ? '#e8f5e9' : '#fff3e0',
                                                color: story.approved ? '#2e7d32' : '#e65100',
                                                fontWeight: 700
                                            }}>
                                                {story.approved ? '✓ Julkaistu' : '⏳ Odottaa'}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{story.content}&rdquo;</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                            {new Date(story.created_at).toLocaleDateString('fi-FI')}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteStory(story.id)} style={{ color: '#dc2626', flexShrink: 0 }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
