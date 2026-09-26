"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, MapPin, Camera, Send, CheckCircle2, X, AlertCircle, Scale, Hash } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadBikeImages } from "@/lib/images";
import { BIKE_COLORS, BIKE_TYPES, CITIES } from "@/lib/bikes";

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em'
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)',
    fontSize: '16px', backgroundColor: '#fff', fontFamily: 'inherit'
};

const today = () => new Date().toISOString().slice(0, 10);

export default function FoundBike() {
    const [formData, setFormData] = useState({
        serial_number: "",
        brand: "",
        model: "",
        type: "Kaupunki",
        color: "",
        city: "",
        location: "",
        event_date: today(),
        description: "",
        finder_email: "",
        website: "" // honeypot
    });
    const [userId, setUserId] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                setFormData(f => ({ ...f, finder_email: f.finder_email || user.email || "" }));
            }
        });
    }, []);

    const set = (field: keyof typeof formData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setFormData(f => ({ ...f, [field]: e.target.value }));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);
        const { urls, error } = await uploadBikeImages(files, "found", images);
        setImages(urls);
        if (error) setError(error);
        setUploading(false);
        e.target.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.website) {
            // Bot filled the hidden field – pretend success, store nothing.
            setSuccess(true);
            return;
        }
        setLoading(true);
        setError(null);

        const { error } = await supabase.from('bikes').insert([
            {
                serial_number: formData.serial_number.trim() || null,
                brand: formData.brand.trim() || "Tuntematon",
                model: formData.model.trim() || null,
                type: formData.type,
                color: formData.color.trim() || null,
                city: formData.city.trim() || null,
                location: formData.location.trim(),
                event_date: formData.event_date || null,
                description: formData.description.trim() || null,
                finder_email: formData.finder_email.trim() || null,
                status: 'ilmoitettu',
                image_url: images[0] || null,
                images: images,
                user_id: userId
            }
        ]);

        setLoading(false);
        if (error) {
            setError("Ilmoituksen tallennus epäonnistui: " + error.message);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '520px' }}>
                        <div style={{ backgroundColor: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle2 size={32} color="#000" />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Kiitos ilmoituksestasi!</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                            Vertasimme pyörää heti kaikkiin varkaus- ja rekisteröintitietoihin. Jos se vastaa jonkun
                            ilmoitusta, omistaja saa ilmoituksen ja voi ottaa sinuun yhteyttä CycleFoundin kautta.
                            Sähköpostiosoitettasi ei näytetä kenellekään.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/" className="primary-button">Etusivulle</Link>
                            {userId && <Link href="/dashboard" className="secondary-button">Omat ilmoitukset</Link>}
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '600px', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <Link href="/" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Takaisin</span>
                    </Link>
                    <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Löysin pyörän</h1>
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                    Ilmoitus vertautuu automaattisesti varastettuihin ja rekisteröityihin pyöriin. Mitä enemmän
                    tietoja annat, sitä varmemmin omistaja löytyy. Et tarvitse käyttäjätiliä.
                </p>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '0', border: 'none', background: 'transparent' }}>
                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Pyörän tiedot</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle} htmlFor="serial"><Hash size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Sarjanumero / runkonumero</label>
                                <input id="serial" type="text" value={formData.serial_number} onChange={set('serial_number')}
                                    placeholder="esim. WTU283C0912K" style={inputStyle} autoComplete="off" />
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                                    Tärkein tunniste! Löytyy yleensä rungon alta polkimien välistä. Sarjanumeroa ei näytetä julkisesti.
                                </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="brand">Merkki</label>
                                    <input id="brand" type="text" value={formData.brand} onChange={set('brand')} placeholder="esim. Helkama" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle} htmlFor="model">Malli</label>
                                    <input id="model" type="text" value={formData.model} onChange={set('model')} placeholder="esim. Jopo" style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="type">Tyyppi</label>
                                    <select id="type" value={formData.type} onChange={set('type')} style={inputStyle}>
                                        {BIKE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle} htmlFor="color">Väri</label>
                                    <input id="color" list="bike-colors" value={formData.color} onChange={set('color')} placeholder="esim. musta" style={inputStyle} />
                                    <datalist id="bike-colors">{BIKE_COLORS.map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle} htmlFor="description">Kuvaus ja tuntomerkit</label>
                                <textarea id="description" value={formData.description} onChange={set('description')}
                                    placeholder="Tarrat, kori, lukko, vauriot..."
                                    style={{ ...inputStyle, minHeight: '100px' }} />
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> Löytöpaikka
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="city">Kaupunki *</label>
                                    <input id="city" list="cities" value={formData.city} onChange={set('city')} required placeholder="esim. Helsinki" style={inputStyle} />
                                    <datalist id="cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                                <div>
                                    <label style={labelStyle} htmlFor="event_date">Löytöpäivä</label>
                                    <input id="event_date" type="date" value={formData.event_date} max={today()} onChange={set('event_date')} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle} htmlFor="location">Paikka *</label>
                                <input id="location" type="text" value={formData.location} onChange={set('location')} required
                                    placeholder="esim. Rautatientori" style={inputStyle} />
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Kuvat</h2>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)' }}>Max 4</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {images.map((url, index) => (
                                <div key={url} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="Löydetty pyörä" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                    <button type="button" aria-label="Poista kuva" onClick={() => setImages(images.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff1744', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 4 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100px', height: '100px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '4px', background: 'transparent', cursor: 'pointer' }}>
                                    <Camera size={24} />
                                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{uploading ? "LADATAAN..." : "LISÄÄ"}</span>
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Kuvista poistetaan automaattisesti sijaintitiedot (GPS) ennen tallennusta.
                        </p>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple style={{ display: 'none' }} />
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Yhteystietosi</h2>
                        <label style={labelStyle} htmlFor="finder_email">Sähköposti (suositeltu)</label>
                        <input id="finder_email" type="email" value={formData.finder_email} onChange={set('finder_email')}
                            placeholder="esim. etunimi@esim.fi" style={inputStyle} />
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                            Ei näytetä julkisesti. Käytämme sitä vain välittääksemme omistajan viestin sinulle.
                        </p>
                        {/* Honeypot – hidden from people, bots fill it. */}
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                            value={formData.website} onChange={set('website')}
                            style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', opacity: 0 }} />
                    </section>

                    <button type="submit" disabled={loading || uploading} className="primary-button" style={{ width: '100%', padding: '18px', borderRadius: '16px', justifyContent: 'center', fontSize: '18px', marginBottom: '32px', opacity: (loading || uploading) ? 0.7 : 1 }}>
                        {loading ? "Lähetetään..." : "Ilmoita löydöstä"} <Send size={20} />
                    </button>

                    <section style={{ backgroundColor: '#e8f5e9', padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Scale size={20} /> Hyvä tietää
                        </h3>
                        <ul style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px', lineHeight: 1.5 }}>
                            <li>Löytötavaralain mukaan löydöstä on ilmoitettava omistajalle tai poliisille. CycleFound auttaa löytämään omistajan, mutta ei korvaa ilmoitusta poliisille.</li>
                            <li>Älä luovuta pyörää ilman todistetta omistajuudesta (kuitti, sarjanumero, vanhat kuvat). Tapaa julkisella paikalla.</li>
                            <li>Jos epäilet pyörän olevan varastettu ja näet epäilyttävää toimintaa, soita 112.</li>
                        </ul>
                    </section>
                </form>
            </div>
            <Footer />
        </main>
    );
}
