"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/I18nProvider";

interface ContactFormProps {
    bikeId: string | number;
    /** Who receives the message – only used for the wording. */
    recipient: "omistaja" | "löytäjä";
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    fontSize: '15px',
    fontFamily: 'inherit'
};

/**
 * Sends a message to a bike's owner (or finder) through BikeBack. The
 * recipient's e-mail / phone are never shown; they read the message on their
 * dashboard (and by e-mail once the notify-owner function is deployed).
 */
export default function ContactForm({ bikeId, recipient }: ContactFormProps) {
    const [form, setForm] = useState({ name: "", email: "", phone: "", body: "", website: "" });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useI18n();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Honeypot: real users never see or fill the "website" field.
        if (form.website) {
            setSent(true);
            return;
        }
        setSending(true);
        setError(null);

        const { error } = await supabase.from("bike_messages").insert({
            bike_id: bikeId,
            sender_name: form.name.trim(),
            sender_email: form.email.trim(),
            sender_phone: form.phone.trim() || null,
            body: form.body.trim()
        });

        setSending(false);
        if (error) {
            setError(error.message.includes("check constraint")
                ? t("contact.errCheck")
                : error.message);
        } else {
            setSent(true);
        }
    };

    if (sent) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32', fontWeight: 600, padding: '12px 0' }}>
                <CheckCircle2 size={20} /> {t(recipient === "omistaja" ? "contact.sentOwner" : "contact.sentFinder")}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            <input style={inputStyle} placeholder={t("contact.name")} required maxLength={100}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={inputStyle} type="email" placeholder={t("contact.email")} required maxLength={200}
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input style={inputStyle} type="tel" placeholder={t("contact.phone")} maxLength={40}
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} required minLength={5} maxLength={2000}
                placeholder={t(recipient === "omistaja" ? "contact.bodyOwner" : "contact.bodyFinder")}
                value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
            {/* Honeypot – hidden from people, bots fill it. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', opacity: 0 }} />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px', lineHeight: 1.5 }}>
                <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                {t("contact.privacy")}
            </p>
            <button type="submit" className="primary-button" disabled={sending}
                style={{ justifyContent: 'center', padding: '14px', fontSize: '15px', opacity: sending ? 0.7 : 1 }}>
                <Send size={18} /> {sending ? t("common.sending") : t("contact.send")}
            </button>
        </form>
    );
}
