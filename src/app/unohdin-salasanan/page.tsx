"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/I18nProvider";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useI18n();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/uusi-salasana`
        });
        setSending(false);
        // Don't reveal whether the address has an account – only show real errors (e.g. rate limit).
        if (error && error.status !== 400) setError(error.message);
        else setSent(true);
    };

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />
            <div className="container" style={{ maxWidth: '420px', padding: '80px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px' }}>{t("reset.title")}</h1>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{t("reset.text")}</p>
                </div>
                <div className="card" style={{ padding: '32px' }}>
                    {sent ? (
                        <p style={{ display: 'flex', gap: '10px', color: '#2e7d32', fontWeight: 600, lineHeight: 1.5 }}>
                            <CheckCircle2 size={22} style={{ flexShrink: 0 }} /> {t("reset.sent")}
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {error && (
                                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', gap: '8px' }}>
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={t("auth.emailPlaceholder")}
                                    aria-label={t("auth.email")}
                                    style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>
                            <button type="submit" className="primary-button" disabled={sending} style={{ justifyContent: 'center', padding: '16px', opacity: sending ? 0.7 : 1 }}>
                                {sending ? t("common.sending") : t("reset.send")} <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                    <Link href="/kirjaudu" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{t("login.submit")}</Link>
                </p>
            </div>
            <Footer />
        </main>
    );
}
