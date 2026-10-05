"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Save, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Target of the password-reset e-mail. Supabase puts a recovery session in
 * the URL; supabase-js picks it up automatically and fires PASSWORD_RECOVERY.
 */
export default function NewPasswordPage() {
    const [password, setPassword] = useState("");
    const [ready, setReady] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useI18n();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" || session) setReady(true);
        });
        // If no recovery session appears shortly, the link is invalid or expired.
        const timer = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setReady(r => r ?? Boolean(session));
        }, 1500);
        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const { error } = await supabase.auth.updateUser({ password });
        setSaving(false);
        if (error) {
            setError(error.message);
        } else {
            setSaved(true);
            setTimeout(() => router.push("/dashboard"), 1500);
        }
    };

    return (
        <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
            <Header />
            <div className="container" style={{ maxWidth: '420px', padding: '80px 24px' }}>
                <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>{t("reset.newTitle")}</h1>
                <div className="card" style={{ padding: '32px' }}>
                    {saved ? (
                        <p style={{ display: 'flex', gap: '10px', color: '#2e7d32', fontWeight: 600 }}>
                            <CheckCircle2 size={22} /> {t("reset.saved")}
                        </p>
                    ) : ready === false ? (
                        <div>
                            <p style={{ marginBottom: '16px', lineHeight: 1.6 }}>{t("reset.invalidLink")}</p>
                            <Link href="/unohdin-salasanan" className="primary-button">{t("reset.send")}</Link>
                        </div>
                    ) : ready === null ? (
                        <p style={{ color: 'var(--text-muted)' }}>{t("common.loading")}</p>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {error && (
                                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', gap: '8px' }}>
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={t("reset.newPassword")}
                                    aria-label={t("reset.newPassword")}
                                    style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>
                            <button type="submit" className="primary-button" disabled={saving} style={{ justifyContent: 'center', padding: '16px', opacity: saving ? 0.7 : 1 }}>
                                {saving ? t("common.sending") : t("reset.save")} <Save size={18} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
