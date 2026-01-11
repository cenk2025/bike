"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EditBikePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        serial_number: "",
        type: "Maastopyörä",
        location: "",
        status: "varastettu"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBike = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/kirjaudu");
                return;
            }

            const { data, error } = await supabase
                .from('bikes')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                setError("Pyörää ei löytynyt.");
                setLoading(false);
            } else {
                setFormData({
                    brand: data.brand,
                    model: data.model,
                    serial_number: data.serial_number,
                    type: data.type || "Maastopyörä",
                    location: data.location || "",
                    status: data.status
                });
                setLoading(false);
            }
        };
        fetchBike();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { error } = await supabase
            .from('bikes')
            .update(formData)
            .eq('id', id);

        if (error) {
            setError(error.message);
            setSaving(false);
        } else {
            router.push("/dashboard");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 700 }}>Ladataan...</div>;

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '600px', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <Link href="/dashboard" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Takaisin</span>
                    </Link>
                    <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Muokkaa ilmoitusta</h1>
                </div>

                <form onSubmit={handleSave} className="card" style={{ padding: '32px' }}>
                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Tila</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: '#fff' }}
                            >
                                <option value="varastettu">Varastettu</option>
                                <option value="löytynyt">Löytynyt</option>
                                <option value="ilmoitettu">Ilmoitettu</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Merkki</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Malli</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Sarjanumero</label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Tyyppi</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: '#fff' }}
                            >
                                <option value="Maastopyörä">Maastopyörä</option>
                                <option value="Maantie">Maantie</option>
                                <option value="Sähkö">Sähkö</option>
                                <option value="Kaupunki">Kaupunki</option>
                                <option value="Muu">Muu</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Viimeisin sijainti</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="esim. Mannerheimintie 10, Helsinki"
                                required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="primary-button"
                            style={{
                                width: '100%',
                                padding: '18px',
                                borderRadius: '16px',
                                justifyContent: 'center',
                                fontSize: '18px',
                                marginTop: '12px',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? "Tallennetaan..." : "Tallenna muutokset"} <Save size={20} />
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </main>
    );
}
