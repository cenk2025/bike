"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Info, MapPin, Camera, Send, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function FoundBike() {
    const [formData, setFormData] = useState({
        brand: "",
        description: "",
        location: ""
    });
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages = [...images];

        for (let i = 0; i < files.length; i++) {
            if (newImages.length >= 4) break;
            const file = files[i];
            const fileName = `${Math.random()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('bike-images')
                .upload(`found/${fileName}`, file);

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('bike-images')
                    .getPublicUrl(`found/${fileName}`);
                newImages.push(publicUrl);
            }
        }
        setImages(newImages);
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('bikes').insert([
            {
                brand: formData.brand,
                model: "Unknown", // Found bikes might not have model known
                description: formData.description,
                location: formData.location,
                status: 'ilmoitettu',
                image_url: images[0] || null,
                images: images,
                type: "Muu",
                serial_number: "FOUND-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                user_id: (await supabase.auth.getUser()).data.user?.id // Can be null for guest reports if RLS allows
            }
        ]);

        if (!error) {
            setSuccess(true);
            setTimeout(() => router.push("/"), 3000);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ backgroundColor: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle2 size={32} color="#000" />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Kiitos ilmoituksestasi!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Tietosi on tallennettu. Autat tekemään kaupungista turvallisemman.</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Löysin pyörän</h1>
                        <Info size={18} />
                    </div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Löydetyn pyörän tiedot</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-dark)', backgroundColor: '#e8f5e9', padding: '2px 8px', borderRadius: '4px' }}>1 / 2</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '50%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '0', border: 'none', background: 'transparent' }}>
                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Pyörän kuvaus</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Merkki (jos tiedossa)</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="esim. Trek Marlin"
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Kuvaus ja tuntomerkit</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Väri, erityispiirteet..."
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', minHeight: '100px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> Löytöpaikka
                        </h2>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="esim. Rautatientori, Helsinki"
                            required
                            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                        />
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Ota kuvia</h2>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)' }}>Max 4</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {images.map((url, index) => (
                                <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    <img src={url} alt="Found bike" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                    <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff1744', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 4 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100px', height: '100px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '4px', background: 'transparent', cursor: 'pointer' }}>
                                    <Camera size={24} />
                                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{uploading ? "LATAU..." : "LISÄÄ"}</span>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple style={{ display: 'none' }} />
                    </section>

                    <button type="submit" disabled={loading || uploading} className="primary-button" style={{ width: '100%', padding: '18px', borderRadius: '16px', justifyContent: 'center', fontSize: '18px', marginBottom: '40px', opacity: (loading || uploading) ? 0.7 : 1 }}>
                        {loading ? "Lähetetään..." : "Ilmoita löydöstä"} <Send size={20} />
                    </button>
                </form>
            </div>
            <Footer />
        </main>
    );
}
