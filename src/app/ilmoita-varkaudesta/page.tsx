"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Info, MapPin, Camera, Send, ShieldAlert, AlertCircle, X, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function ReportStolen() {
    const [formData, setFormData] = useState({
        serial_number: "",
        brand: "",
        model: "",
        type: "Maastopyörä",
        location: "",
        allow_contact: false,
        contact_email: "",
        contact_phone: ""
    });
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/kirjaudu?next=/ilmoita-varkaudesta");
            } else {
                setUser(user);
                // Pre-fill the contact email with the account email so the
                // common path (use the login email) is a single checkbox tick.
                setFormData(f => ({
                    ...f,
                    contact_email: f.contact_email || user.email || ""
                }));
            }
        };
        checkUser();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        // Auth check hasn't resolved yet; the redirect in useEffect will take over.
        if (!user) return;

        setUploading(true);
        setError(null);

        const newImages = [...images];

        for (let i = 0; i < files.length; i++) {
            if (newImages.length >= 4) break;

            const file = files[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('bike-images')
                .upload(filePath, file);

            if (uploadError) {
                setError("Kuvan lataus epäonnistui. Tarkista, että tallennus on oikein konfiguroitu.");
                setUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('bike-images')
                .getPublicUrl(filePath);

            newImages.push(publicUrl);
        }

        setImages(newImages);
        setUploading(false);
    };


    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // If contact is allowed, require at least one channel.
        if (formData.allow_contact && !formData.contact_email.trim() && !formData.contact_phone.trim()) {
            setError("Anna joko sähköposti tai puhelinnumero, jotta sinuun voidaan ottaa yhteyttä.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.from('bikes').insert([
            {
                serial_number: formData.serial_number,
                brand: formData.brand,
                model: formData.model,
                type: formData.type,
                location: formData.location,
                allow_contact: formData.allow_contact,
                // Only persist contact details when the user opted in;
                // otherwise leave the columns null.
                contact_email: formData.allow_contact ? (formData.contact_email.trim() || null) : null,
                contact_phone: formData.allow_contact ? (formData.contact_phone.trim() || null) : null,
                user_id: user.id,
                status: 'varastettu',
                image_url: images[0] || null, // Primary image
                images: images, // Array of all images
                created_at: new Date().toISOString()
            }
        ]);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '600px', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <Link href="/" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Takaisin</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Ilmoita varkaus</h1>
                        <Info size={18} />
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Pyörän tiedot</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-dark)', backgroundColor: '#e8f5e9', padding: '2px 8px', borderRadius: '4px' }}>1 / 3</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '33%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '0', border: 'none', background: 'transparent' }}>
                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Yleiset tiedot
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    SARJANUMERO
                                </label>
                                <input
                                    type="text"
                                    name="serial_number"
                                    value={formData.serial_number}
                                    onChange={handleChange}
                                    placeholder="esim. SN12345678"
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    MERKKI
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="esim. Trek"
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    MALLI
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="esim. Marlin 7"
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    PYÖRÄN TYYPPI
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: '#fff' }}
                                >
                                    <option value="Maastopyörä">Maastopyörä</option>
                                    <option value="Maantie">Maantie</option>
                                    <option value="Sähkö">Sähkö</option>
                                    <option value="Kaupunki">Kaupunki</option>
                                    <option value="Muu">Muu</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> Varkauspaikka
                        </h2>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                OSOITE TAI ALUE
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="esim. Mannerheimintie 10, Helsinki"
                                required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                            />
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Kirjoita mahdollisimman tarkka osoite tai paikan nimi.</p>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Lataa kuvia</h2>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)' }}>Max 4</span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {images.map((url, index) => (
                                <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    <img src={url} alt="Bicycle" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff1744', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {images.length < 4 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{ width: '100px', height: '100px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                                >
                                    <Camera size={24} />
                                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{uploading ? "LATAA..." : "LISÄÄ"}</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                        />
                    </section>

                    {/* ── Contact preferences ── */}
                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Yhteydenotot</h2>

                        <label
                            htmlFor="allow_contact"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '16px',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                backgroundColor: formData.allow_contact ? '#e8f5e9' : '#fff',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <input
                                id="allow_contact"
                                type="checkbox"
                                checked={formData.allow_contact}
                                onChange={(e) => setFormData({ ...formData, allow_contact: e.target.checked })}
                                style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary-dark)' }}
                            />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '15px' }}>Minuun saa ottaa yhteyttä</div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Jos joku löytää pyöräsi, hän voi ottaa sinuun yhteyttä alla antamillasi tiedoilla.
                                </p>
                            </div>
                        </label>

                        {formData.allow_contact && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingLeft: '8px', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ paddingLeft: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', alignItems: 'center', gap: '6px' }}>
                                        <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                        SÄHKÖPOSTI
                                    </label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        placeholder="esim. etunimi@esim.fi"
                                        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                    />
                                </div>

                                <div style={{ paddingLeft: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                        PUHELIN
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact_phone"
                                        value={formData.contact_phone}
                                        onChange={handleChange}
                                        placeholder="esim. +358 40 123 4567"
                                        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                    />
                                </div>

                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '14px' }}>
                                    Anna ainakin toinen näistä. Ne näkyvät julkisesti pyörän ilmoituksessa.
                                </p>
                            </div>
                        )}
                    </section>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="primary-button"
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '16px',
                            justifyContent: 'center',
                            fontSize: '18px',
                            marginBottom: '40px',
                            opacity: (loading || uploading) ? 0.7 : 1
                        }}
                    >
                        {loading ? "Lähetetään..." : "Lähetä ilmoitus"} <Send size={20} />
                    </button>

                    <section style={{ backgroundColor: '#e8f5e9', padding: '24px', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={20} /> Turvaohjeet
                        </h3>
                        <ol style={{ fontSize: '14px', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
                            <li>Tee rikosilmoitus välittömästi osoitteessa <a href="#" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>poliisi.fi</a></li>
                            <li>Ota yhteyttä vakuutusyhtiöösi ja ilmoita sarjanumero sekä ostokuitti.</li>
                        </ol>
                    </section>
                </form>
            </div>

            <Footer />
        </main>
    );
}
