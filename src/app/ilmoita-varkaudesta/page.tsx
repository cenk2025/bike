"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, MapPin, Camera, Send, ShieldAlert, AlertCircle, X, Mail, Phone, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
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

type Mode = "varastettu" | "rekisteröity";

export default function ReportStolen() {
    const [mode, setMode] = useState<Mode>("varastettu");
    const [formData, setFormData] = useState({
        serial_number: "",
        brand: "",
        model: "",
        type: "Kaupunki",
        color: "",
        city: "",
        location: "",
        event_date: today(),
        police_report_number: "",
        description: "",
        allow_contact: true,
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
        const initialMode: Mode = new URLSearchParams(window.location.search).get("tila") === "rekisteroi"
            ? "rekisteröity" : "varastettu";

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const next = initialMode === "rekisteröity" ? "/ilmoita-varkaudesta?tila=rekisteroi" : "/ilmoita-varkaudesta";
                router.push(`/kirjaudu?next=${encodeURIComponent(next)}`);
            } else {
                setUser(user);
                setMode(initialMode);
                // Pre-fill the contact email with the account email so the
                // common path (use the login email) needs no typing.
                setFormData(f => ({
                    ...f,
                    contact_email: f.contact_email || user.email || ""
                }));
            }
        };
        checkUser();
    }, [router]);

    const set = (field: keyof typeof formData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setFormData(f => ({ ...f, [field]: e.target.value }));

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        // Auth check hasn't resolved yet; the redirect in useEffect will take over.
        if (!user) return;

        setUploading(true);
        setError(null);
        const { urls, error } = await uploadBikeImages(files, user.id, images);
        setImages(urls);
        if (error) setError(error);
        setUploading(false);
        e.target.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (formData.allow_contact && !formData.contact_email.trim() && !formData.contact_phone.trim()) {
            setError("Anna joko sähköposti tai puhelinnumero ilmoituksia varten.");
            return;
        }

        setLoading(true);
        setError(null);

        const stolen = mode === "varastettu";
        const { error } = await supabase.from('bikes').insert([
            {
                serial_number: formData.serial_number.trim(),
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                type: formData.type,
                color: formData.color.trim() || null,
                city: formData.city.trim() || null,
                location: formData.location.trim(),
                event_date: stolen ? (formData.event_date || null) : null,
                police_report_number: stolen ? (formData.police_report_number.trim() || null) : null,
                description: formData.description.trim() || null,
                allow_contact: formData.allow_contact,
                // Only persist contact details when the user opted in;
                // otherwise leave the columns null.
                contact_email: formData.allow_contact ? (formData.contact_email.trim() || null) : null,
                contact_phone: formData.allow_contact ? (formData.contact_phone.trim() || null) : null,
                user_id: user.id,
                status: mode,
                image_url: images[0] || null,
                images: images
            }
        ]);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    const stolen = mode === "varastettu";

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '600px', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <Link href="/" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Takaisin</span>
                    </Link>
                    <h1 style={{ fontSize: '18px', fontWeight: 700 }}>{stolen ? "Ilmoita varkaus" : "Rekisteröi pyörä"}</h1>
                </div>

                {/* Mode switch */}
                <div role="radiogroup" aria-label="Ilmoituksen tyyppi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                    {([
                        { value: "varastettu", icon: <AlertTriangle size={20} />, title: "Pyöräni on varastettu", text: "Julkinen ilmoitus + automaattinen haku" },
                        { value: "rekisteröity", icon: <ShieldCheck size={20} />, title: "Rekisteröin ennakkoon", text: "Ei julkinen. Valmiina, jos pyörä katoaa" }
                    ] as const).map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={mode === opt.value}
                            onClick={() => setMode(opt.value)}
                            style={{
                                textAlign: 'left', padding: '16px', borderRadius: '14px',
                                border: mode === opt.value ? '2px solid var(--text)' : '1px solid var(--border)',
                                backgroundColor: mode === opt.value ? (opt.value === 'varastettu' ? '#fee2e2' : '#f3e5f5') : '#fff'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>{opt.icon} {opt.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.text}</div>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '0', border: 'none', background: 'transparent' }}>
                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Pyörän tiedot</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle} htmlFor="serial">Sarjanumero / runkonumero (VIN) *</label>
                                <input id="serial" type="text" value={formData.serial_number} onChange={set('serial_number')}
                                    placeholder="esim. WTU283C0912K" required autoComplete="off" style={inputStyle} />
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                                    Löytyy yleensä rungon alta polkimien välistä, ostokuitista tai takuukortista.
                                    Sarjanumeroa ei näytetä julkisesti – sitä käytetään vain automaattiseen vertailuun.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="brand">Merkki *</label>
                                    <input id="brand" type="text" value={formData.brand} onChange={set('brand')} placeholder="esim. Trek" required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle} htmlFor="model">Malli *</label>
                                    <input id="model" type="text" value={formData.model} onChange={set('model')} placeholder="esim. Marlin 7" required style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="type">Tyyppi</label>
                                    <select id="type" value={formData.type} onChange={set('type')} required style={inputStyle}>
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
                                <label style={labelStyle} htmlFor="description">Tuntomerkit</label>
                                <textarea id="description" value={formData.description} onChange={set('description')}
                                    placeholder="Tarrat, kori, lisävarusteet, naarmut..." style={{ ...inputStyle, minHeight: '100px' }} />
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> {stolen ? "Varkauspaikka" : "Kotipaikka"}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: stolen ? '1fr 1fr' : '1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="city">Kaupunki *</label>
                                    <input id="city" list="cities" value={formData.city} onChange={set('city')} required placeholder="esim. Helsinki" style={inputStyle} />
                                    <datalist id="cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                                {stolen && (
                                    <div>
                                        <label style={labelStyle} htmlFor="event_date">Varkauspäivä</label>
                                        <input id="event_date" type="date" value={formData.event_date} max={today()} onChange={set('event_date')} style={inputStyle} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle} htmlFor="location">{stolen ? "Osoite tai alue *" : "Alue *"}</label>
                                <input id="location" type="text" value={formData.location} onChange={set('location')} required
                                    placeholder={stolen ? "esim. Mannerheimintie 10" : "esim. Kallio"} style={inputStyle} />
                            </div>
                            {stolen && (
                                <div>
                                    <label style={labelStyle} htmlFor="police">Rikosilmoituksen numero</label>
                                    <input id="police" type="text" value={formData.police_report_number} onChange={set('police_report_number')}
                                        placeholder="esim. 5010/R/12345/26" style={inputStyle} />
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                        Ei näytetä julkisesti. Vakuutusyhtiö tarvitsee sen korvaushakemukseen.
                                    </p>
                                </div>
                            )}
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
                                    <img src={url} alt="Pyörä" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                    <button
                                        type="button"
                                        aria-label="Poista kuva"
                                        onClick={() => setImages(images.filter((_, i) => i !== index))}
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
                                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{uploading ? "LADATAAN..." : "LISÄÄ"}</span>
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Kuvista poistetaan automaattisesti sijaintitiedot (GPS). Kuvaa myös sarjanumero ja erikoiset tuntomerkit.
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                        />
                    </section>

                    {/* ── Notification preferences ── */}
                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Ilmoitukset</h2>

                        <label
                            htmlFor="allow_contact"
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px',
                                border: '1px solid var(--border)', borderRadius: '12px',
                                backgroundColor: formData.allow_contact ? '#e8f5e9' : '#fff',
                                cursor: 'pointer', transition: 'background-color 0.2s'
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
                                <div style={{ fontWeight: 700, fontSize: '15px' }}>Ilmoita minulle osumista ja viesteistä</div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Saat tiedon, kun joku ilmoittaa löytäneensä vastaavan pyörän tai lähettää sinulle viestin.
                                </p>
                            </div>
                        </label>

                        {formData.allow_contact && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingLeft: '8px', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ paddingLeft: '14px' }}>
                                    <label style={labelStyle} htmlFor="contact_email">
                                        <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                        Sähköposti
                                    </label>
                                    <input id="contact_email" type="email" value={formData.contact_email} onChange={set('contact_email')}
                                        placeholder="esim. etunimi@esim.fi" style={inputStyle} />
                                </div>

                                <div style={{ paddingLeft: '14px' }}>
                                    <label style={labelStyle} htmlFor="contact_phone">
                                        <Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                        Puhelin
                                    </label>
                                    <input id="contact_phone" type="tel" value={formData.contact_phone} onChange={set('contact_phone')}
                                        placeholder="esim. +358 40 123 4567" style={inputStyle} />
                                </div>

                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '14px', display: 'flex', gap: '6px' }}>
                                    <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                                    Yhteystietojasi ei näytetä julkisesti. Löytäjät lähettävät viestit CycleFoundin kautta.
                                </p>
                            </div>
                        )}
                    </section>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="primary-button"
                        style={{ width: '100%', padding: '18px', borderRadius: '16px', justifyContent: 'center', fontSize: '18px', marginBottom: '40px', opacity: (loading || uploading) ? 0.7 : 1 }}
                    >
                        {loading ? "Lähetetään..." : stolen ? "Lähetä ilmoitus" : "Rekisteröi pyörä"} <Send size={20} />
                    </button>

                    {stolen && (
                        <section style={{ backgroundColor: '#e8f5e9', padding: '24px', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldAlert size={20} /> Tee myös nämä
                            </h3>
                            <ol style={{ fontSize: '14px', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
                                <li>Tee rikosilmoitus osoitteessa <a href="https://poliisi.fi/rikosilmoitus" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>poliisi.fi</a> ja lisää sen numero tähän ilmoitukseen.</li>
                                <li>Ota yhteyttä vakuutusyhtiöösi ja ilmoita sarjanumero sekä ostokuitti.</li>
                                <li>Seuraa Tori.fi:tä ja Facebook Marketplacea – varastettuja pyöriä myydään usein pian varkauden jälkeen.</li>
                            </ol>
                        </section>
                    )}
                </form>
            </div>

            <Footer />
        </main>
    );
}
