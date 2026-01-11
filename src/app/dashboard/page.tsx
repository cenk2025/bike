"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus, Settings, Trash2, Edit2, Bike, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface BikeData {
    id: string;
    brand: string;
    model: string;
    serial_number: string;
    status: string;
    location: string;
    created_at: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [bikes, setBikes] = useState<BikeData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/kirjaudu");
            } else {
                setUser(user);
                fetchBikes(user.id);
            }
        };
        checkUser();
    }, [router]);

    const fetchBikes = async (userId: string) => {
        const { data, error } = await supabase
            .from('bikes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBikes(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Haluatko varmasti poistaa tämän ilmoituksen?")) {
            const { error } = await supabase.from('bikes').delete().eq('id', id);
            if (!error) {
                setBikes(bikes.filter(b => b.id !== id));
            }
        }
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Hei, {user?.user_metadata?.full_name || 'Käyttäjä'}!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Täällä voit hallinnoida pyöriäsi ja ilmoituksiasi.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href="/ilmoita-varkaudesta" className="primary-button" style={{ borderRadius: '12px' }}>
                            <Plus size={20} /> Lisää pyörä
                        </Link>
                        <button onClick={handleLogout} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 600, backgroundColor: '#fff' }}>
                            Kirjaudu ulos
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
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
                                <div key={bike.id} className="card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            backgroundColor: bike.status === 'varastettu' ? '#fee2e2' : '#e8f5e9',
                                            color: bike.status === 'varastettu' ? '#dc2626' : '#2e7d32',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {bike.status === 'varastettu' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                            {bike.status.toUpperCase()}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ color: 'var(--text-muted)' }} onClick={() => router.push(`/dashboard/muokkaa/${bike.id}`)}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button style={{ color: '#dc2626' }} onClick={() => handleDelete(bike.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{bike.brand} {bike.model}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>SN: {bike.serial_number}</p>

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            Lisätty: {new Date(bike.created_at).toLocaleDateString('fi-FI')}
                                        </span>
                                        <button style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                                            Tiedot
                                        </button>
                                    </div>
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
