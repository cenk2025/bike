"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useIsAdmin, type AdSlot } from "@/lib/admin";
import {
    ArrowLeft, Save, AlertCircle, Camera, X, Image as ImageIcon,
    CheckCircle, Shield, RefreshCw, Eye, EyeOff
} from "lucide-react";

// Editable fields per slot. We keep `slug` immutable in the UI so admins can't
// accidentally retarget which homepage box a row drives.
type SlotForm = Omit<AdSlot, "updated_at">;

const SLOT_LABELS: Record<string, { name: string; hint: string }> = {
    insurance: {
        name: "Vakuutus-kumppanuus (vihreä laatikko)",
        hint: "Etusivun ensimmäinen kutu — vakuutusyhtiöille suunnattu kumppanuuskutsu."
    },
    premium: {
        name: "Premium-mainospaikka (musta laatikko)",
        hint: "Etusivun toinen kutu — pyörä- ja moottoripyöräyhtiöille avoin mainospaikka."
    }
};

export default function AdminPage() {
    const router = useRouter();
    const { loading: adminLoading, isAdmin } = useIsAdmin();
    const [slots, setSlots] = useState<SlotForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingSlug, setSavingSlug] = useState<string | null>(null);
    const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
    const [savedSlug, setSavedSlug] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const fetchSlots = useCallback(async () => {
        const { data, error } = await supabase
            .from("ad_slots")
            .select("*")
            .order("slug");
        if (error) {
            setError("Mainospaikkojen lataus epäonnistui: " + error.message);
        } else if (data) {
            setSlots(data as SlotForm[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Redirect non-admins as soon as we know.
        if (!adminLoading && isAdmin === false) {
            router.replace("/dashboard");
            return;
        }
        if (isAdmin === true) {
            fetchSlots();
        }
    }, [adminLoading, isAdmin, router, fetchSlots]);

    const updateField = <K extends keyof SlotForm>(slug: string, key: K, value: SlotForm[K]) => {
        setSlots(prev => prev.map(s => (s.slug === slug ? { ...s, [key]: value } : s)));
        setSavedSlug(null);
    };

    const handleImageUpload = async (slug: string, file: File) => {
        setUploadingSlug(slug);
        setError(null);

        const ext = file.name.split(".").pop() || "jpg";
        const path = `${slug}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
            .from("ad-images")
            .upload(path, file, { upsert: true });

        if (uploadError) {
            setError("Kuvan lataus epäonnistui: " + uploadError.message);
            setUploadingSlug(null);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from("ad-images")
            .getPublicUrl(path);

        updateField(slug, "image_url", publicUrl);
        setUploadingSlug(null);
    };

    const handleSave = async (slot: SlotForm) => {
        setSavingSlug(slot.slug);
        setError(null);

        const { error: saveError } = await supabase
            .from("ad_slots")
            .update({
                eyebrow: slot.eyebrow,
                title: slot.title,
                description: slot.description,
                image_url: slot.image_url,
                cta_label: slot.cta_label,
                cta_href: slot.cta_href,
                is_active: slot.is_active
            })
            .eq("slug", slot.slug);

        if (saveError) {
            setError(`Tallennus epäonnistui (${slot.slug}): ${saveError.message}`);
        } else {
            setSavedSlug(slot.slug);
            setTimeout(() => setSavedSlug(null), 3000);
        }
        setSavingSlug(null);
    };

    if (adminLoading) {
        return <FullPageMessage>Tarkistetaan oikeuksia…</FullPageMessage>;
    }
    if (isAdmin === false) {
        // Will be redirected by the effect; render nothing meanwhile.
        return null;
    }

    return (
        <main style={{ backgroundColor: "#fcfcfc", minHeight: "100vh" }}>
            <Header />

            <div className="container" style={{ maxWidth: "800px", padding: "40px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text)" }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Dashboard</span>
                    </Link>
                    <button
                        onClick={fetchSlots}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1px solid var(--border)", borderRadius: "10px", backgroundColor: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                        <RefreshCw size={14} /> Päivitä
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ backgroundColor: "var(--primary)", color: "#000", padding: "8px", borderRadius: "12px", display: "flex" }}>
                        <Shield size={22} />
                    </div>
                    <h1 style={{ fontSize: "26px", fontWeight: 800 }}>Admin · Mainospaikat</h1>
                </div>
                <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
                    Muokkaa etusivun kahta mainoslaatikkoa: tekstit, kuvat ja toimintokutsut.
                    Muutokset näkyvät heti, kun ne on tallennettu.
                </p>

                {error && (
                    <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "14px" }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {loading ? (
                    <FullPageMessage>Ladataan…</FullPageMessage>
                ) : slots.length === 0 ? (
                    <div className="card" style={{ padding: "40px", textAlign: "center", border: "2px dashed var(--border)" }}>
                        <p style={{ color: "var(--text-muted)" }}>
                            Tietokannassa ei ole vielä mainospaikkoja. Aja migration ensin.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        {slots.map(slot => (
                            <SlotEditor
                                key={slot.slug}
                                slot={slot}
                                isSaving={savingSlug === slot.slug}
                                isUploading={uploadingSlug === slot.slug}
                                isSaved={savedSlug === slot.slug}
                                fileInputRef={(el) => { fileRefs.current[slot.slug] = el; }}
                                onField={(key, value) => updateField(slot.slug, key, value)}
                                onUploadClick={() => fileRefs.current[slot.slug]?.click()}
                                onFile={(file) => handleImageUpload(slot.slug, file)}
                                onSave={() => handleSave(slot)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

function FullPageMessage({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontWeight: 700 }}>
            {children}
        </div>
    );
}

// ─── Per-slot editor card ───────────────────────────────────────────────────

interface SlotEditorProps {
    slot: SlotForm;
    isSaving: boolean;
    isUploading: boolean;
    isSaved: boolean;
    fileInputRef: (el: HTMLInputElement | null) => void;
    onField: <K extends keyof SlotForm>(key: K, value: SlotForm[K]) => void;
    onUploadClick: () => void;
    onFile: (file: File) => void;
    onSave: () => void;
}

function SlotEditor({
    slot, isSaving, isUploading, isSaved,
    fileInputRef, onField, onUploadClick, onFile, onSave
}: SlotEditorProps) {
    const meta = SLOT_LABELS[slot.slug] ?? { name: slot.slug, hint: "" };

    return (
        <section className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{meta.name}</h2>
                    {meta.hint && (
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{meta.hint}</p>
                    )}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: "6px 12px", borderRadius: "10px", backgroundColor: slot.is_active ? "#e8f5e9" : "#f5f5f5", border: "1px solid var(--border)" }}>
                    <input
                        type="checkbox"
                        checked={slot.is_active}
                        onChange={(e) => onField("is_active", e.target.checked)}
                        style={{ accentColor: "var(--primary-dark)" }}
                    />
                    {slot.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    {slot.is_active ? "Näkyvissä" : "Piilotettu"}
                </label>
            </header>

            <Field label="Yläotsikko (eyebrow)">
                <input
                    type="text"
                    value={slot.eyebrow ?? ""}
                    onChange={(e) => onField("eyebrow", e.target.value)}
                    placeholder="esim. Mielenrauha"
                    style={textInputStyle}
                />
            </Field>

            <Field label="Otsikko *" required>
                <input
                    type="text"
                    value={slot.title}
                    onChange={(e) => onField("title", e.target.value)}
                    required
                    style={textInputStyle}
                />
            </Field>

            <Field label="Kuvaus">
                <textarea
                    value={slot.description ?? ""}
                    onChange={(e) => onField("description", e.target.value)}
                    rows={4}
                    placeholder="Pidempi selitysteksti, näytetään otsikon alla."
                    style={{ ...textInputStyle, fontFamily: "inherit", resize: "vertical" }}
                />
            </Field>

            <Field label="Mainoskuva">
                {slot.image_url ? (
                    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={slot.image_url}
                            alt={slot.title}
                            style={{ width: "100%", maxHeight: "260px", objectFit: "cover", display: "block" }}
                        />
                        <button
                            type="button"
                            onClick={() => onField("image_url", null)}
                            title="Poista kuva"
                            style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#ff1744", color: "#fff", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", cursor: "pointer" }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onUploadClick}
                        disabled={isUploading}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px", border: "2px dashed var(--border)", borderRadius: "12px", backgroundColor: "transparent", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", width: "100%" }}
                    >
                        {isUploading ? <RefreshCw size={18} className="spin" /> : <Camera size={18} />}
                        {isUploading ? "Ladataan…" : "Lataa kuva"}
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFile(f);
                        e.target.value = "";
                    }}
                    style={{ display: "none" }}
                />
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                    Vapaaehtoinen. Suositus: 1200×600 px, korkeintaan 1 MB.
                </p>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <Field label="CTA-painikkeen teksti">
                    <input
                        type="text"
                        value={slot.cta_label ?? ""}
                        onChange={(e) => onField("cta_label", e.target.value)}
                        placeholder="esim. Ota yhteyttä"
                        style={textInputStyle}
                    />
                </Field>
                <Field label="CTA-linkki">
                    <input
                        type="text"
                        value={slot.cta_href ?? ""}
                        onChange={(e) => onField("cta_href", e.target.value)}
                        placeholder="mailto:info@voon.fi  tai  https://…"
                        style={textInputStyle}
                    />
                </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                {isSaved && (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2e7d32", fontSize: "13px", fontWeight: 600 }}>
                        <CheckCircle size={16} /> Tallennettu
                    </span>
                )}
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving || isUploading}
                    className="primary-button"
                    style={{ borderRadius: "12px", opacity: (isSaving || isUploading) ? 0.7 : 1 }}
                >
                    {isSaving ? "Tallennetaan…" : "Tallenna"} <Save size={18} />
                </button>
            </div>

            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
    );
}

const textInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    fontSize: "15px",
    backgroundColor: "#fff"
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}{required ? "" : ""}
                {!required ? <span style={{ marginLeft: "6px", color: "#bbb", textTransform: "none", fontWeight: 500 }}>· vapaaehtoinen</span> : null}
            </label>
            {children}
        </div>
    );
}

// Side helper: silence the ImageIcon import warning if a future branch removes
// the upload widget. Keeping the import here documents the intent.
export const _ICON_HINT = ImageIcon;
