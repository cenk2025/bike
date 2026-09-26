"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Trash2, Inbox } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { bikeTitle } from "@/lib/bikes";
import { useI18n } from "@/i18n/I18nProvider";

interface MessageRow {
    id: number;
    bike_id: string;
    sender_name: string;
    sender_email: string;
    sender_phone: string | null;
    body: string;
    read_at: string | null;
    created_at: string;
    bikes: { brand: string | null; model: string | null; status: string; user_id: string | null; finder_email: string | null } | null;
}

/**
 * Messages sent to the user's bikes through ContactForm.
 *
 * scope="own"   – messages for bikes the current user owns (dashboard).
 * scope="admin" – messages for anonymous found reports, which have no owner
 *                 account; the admin forwards them to the finder's e-mail.
 */
export default function MessagesPanel({ userId, scope = "own" }: { userId: string; scope?: "own" | "admin" }) {
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const { t, locale } = useI18n();

    useEffect(() => {
        (async () => {
            let query = supabase
                .from("bike_messages")
                .select("id, bike_id, sender_name, sender_email, sender_phone, body, read_at, created_at, bikes!inner(brand, model, status, user_id, finder_email)")
                .order("created_at", { ascending: false })
                .limit(100);
            query = scope === "own" ? query.eq("bikes.user_id", userId) : query.is("bikes.user_id", null);

            const { data, error } = await query;
            if (!error && data) setMessages(data as unknown as MessageRow[]);
        })();
    }, [userId, scope]);

    const markRead = async (id: number) => {
        const readAt = new Date().toISOString();
        const { error } = await supabase.from("bike_messages").update({ read_at: readAt }).eq("id", id);
        if (!error) setMessages(ms => ms.map(m => (m.id === id ? { ...m, read_at: readAt } : m)));
    };

    const remove = async (id: number) => {
        if (!confirm(t("messages.confirmDelete"))) return;
        const { error } = await supabase.from("bike_messages").delete().eq("id", id);
        if (!error) setMessages(ms => ms.filter(m => m.id !== id));
    };

    const unread = messages.filter(m => !m.read_at).length;

    return (
        <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Inbox size={22} color="var(--primary-dark)" />
                {t(scope === "own" ? "messages.title" : "messages.titleAdmin", { n: messages.length })}
                {unread > 0 && (
                    <span style={{ backgroundColor: 'var(--secondary)', color: '#fff', fontSize: '12px', padding: '2px 10px', borderRadius: '20px' }}>{t("messages.new", { n: unread })}</span>
                )}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                {t(scope === "own" ? "messages.text" : "messages.textAdmin")}
            </p>

            {messages.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)' }}>
                    {t("messages.none")}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {messages.map(m => (
                        <div
                            key={m.id}
                            className="card"
                            onClick={() => !m.read_at && markRead(m.id)}
                            style={{ padding: '20px 24px', borderLeft: m.read_at ? '4px solid var(--border)' : '4px solid var(--secondary)', cursor: m.read_at ? 'default' : 'pointer' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <div>
                                    <span style={{ fontWeight: 700 }}>{m.sender_name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}> → {bikeTitle(m.bikes ?? {}, t("card.unknownBike"))}</span>
                                    {!m.read_at && <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--secondary)' }}>{t("messages.badge")}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleString(locale)}</span>
                                    <button aria-label={t("messages.delete")} onClick={e => { e.stopPropagation(); remove(m.id); }} style={{ color: '#dc2626' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p style={{ lineHeight: 1.6, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{m.body}</p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px' }}>
                                <a href={`mailto:${m.sender_email}?subject=${encodeURIComponent(`CycleFound: ${bikeTitle(m.bikes ?? {})}`)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                                    <Mail size={14} /> {m.sender_email}
                                </a>
                                {m.sender_phone && (
                                    <a href={`tel:${m.sender_phone.replace(/\s+/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                                        <Phone size={14} /> {m.sender_phone}
                                    </a>
                                )}
                                {scope === "admin" && (
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {t("messages.finder", { email: m.bikes?.finder_email || t("messages.noEmail") })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
