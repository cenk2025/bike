"use client";

import { useEffect, useState, use, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Save, AlertCircle, Camera, X, Trash2, Image as ImageIcon } from "lucide-react";
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

    // Image state
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchBike = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/kirjaudu");
                return;
            }
            setUserId(user.id);

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
                // Load existing images
                const existingImages: string[] = [];
                if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                    existingImages.push(...data.images);
                } else if (data.image_url) {
                    existingImages.push(data.image_url);
                }
                setImages(existingImages);
                setLoading(false);
            }
        };
        fetchBike();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadError(null);

        const newImages = [...images];

        for (let i = 0; i < files.length; i++) {
            if (newImages.length >= 4) break;
            const file = files[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('bike-images')
                .upload(filePath, file);

            if (uploadError) {
                setUploadError("Kuvan lataus epäonnistui. Tarkista, että tallennus on oikein konfiguroitu.");
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { data, error } = await supabase
            .from('bikes')
            .update({
                ...formData,
                image_url: images[0] || null,
                images: images.length > 0 ? images : [],
            })
            .eq('id', id)
            .select();

        if (error) {
            setError("Tallennus epäonnistui: " + error.message);
            setSaving(false);
        } else if (!data || data.length === 0) {
            setError("Tallennus epäonnistui: sinulla ei ole oikeuksia muokata tätä pyörää. Kokeile kirjautua ulos ja takaisin sisään.");
            setSaving(false);
        } else {
            router.push("/dashboard");
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 700 }}>
            Ladataan...
        </div>
    );

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

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {error && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* ── Image management section ── */}
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ImageIcon size={18} /> Kuvat
                            </h2>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Max 4</span>
                        </div>

                        {uploadError && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} />
                                {uploadError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {images.length === 0 && (
                                <div style={{
                                    width: '100px', height: '100px',
                                    border: '2px dashed var(--border)',
                                    borderRadius: '12px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-muted)', gap: '4px', fontSize: '11px', fontWeight: 600
                                }}>
                                    <ImageIcon size={24} />
                                    EI KUVIA
                                </div>
                            )}

                            {images.map((url, index) => (
                                <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`Kuva ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: index === 0 ? '3px solid var(--primary)' : '1px solid var(--border)' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    {index === 0 && (
                                        <span style={{
                                            position: 'absolute', bottom: '4px', left: '4px',
                                            backgroundColor: 'var(--primary)', color: '#000',
                                            fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px'
                                        }}>PÄÄKUVA</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        title="Poista kuva"
                                        style={{
                                            position: 'absolute', top: '-8px', right: '-8px',
                                            backgroundColor: '#ff1744', color: '#fff', borderRadius: '50%',
                                            width: '24px', height: '24px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid #fff', cursor: 'pointer'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {images.length < 4 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{
                                        width: '100px', height: '100px',
                                        border: '2px dashed var(--border)', borderRadius: '12px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-muted)', gap: '4px', backgroundColor: 'transparent', cursor: 'pointer'
                                    }}
                                >
                                    <Camera size={24} />
                                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{uploading ? "LATAA..." : "LISÄÄ"}</span>
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                        />

                        {images.length > 0 && (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
                                Ensimmäinen kuva on pääkuva. Napsauta <Trash2 size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> -kuvaketta poistaaksesi kuvan.
                            </p>
                        )}
                    </div>

                    {/* ── Form fields ── */}
                    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Tila</label>
                            <select name="status" value={formData.status} onChange={handleChange}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: '#fff' }}>
                                <option value="varastettu">Varastettu</option>
                                <option value="löytynyt">Löytynyt</option>
                                <option value="ilmoitettu">Ilmoitettu</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Merkki</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Malli</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Sarjanumero</label>
                            <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Tyyppi</label>
                            <select name="type" value={formData.type} onChange={handleChange}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', backgroundColor: '#fff' }}>
                                <option value="Maastopyörä">Maastopyörä</option>
                                <option value="Maantie">Maantie</option>
                                <option value="Sähkö">Sähkö</option>
                                <option value="Kaupunki">Kaupunki</option>
                                <option value="Muu">Muu</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Viimeisin sijainti</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange}
                                placeholder="esim. Mannerheimintie 10, Helsinki" required
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="primary-button"
                        style={{ width: '100%', padding: '18px', borderRadius: '16px', justifyContent: 'center', fontSize: '18px', opacity: (saving || uploading) ? 0.7 : 1 }}
                    >
                        {saving ? "Tallennetaan..." : "Tallenna muutokset"} <Save size={20} />
                    </button>
                </form>
            </div>

            <Footer />
        </main>
    );
}
