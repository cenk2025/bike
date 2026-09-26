"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useI18n();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Return to the page that sent the user here (only same-site paths).
            const next = new URLSearchParams(window.location.search).get("next");
            router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
        }
    };

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '400px', padding: '80px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>{t("login.title")}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t("login.subtitle")}</p>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {error && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t("auth.email")}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("auth.emailPlaceholder")}
                                    required
                                    style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t("auth.password")}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="primary-button"
                            style={{ width: '100%', justifyContent: 'center', padding: '16px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? t("login.submitting") : t("login.submit")} <LogIn size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <Link href="/unohdin-salasanan" style={{ fontSize: '14px', color: 'var(--primary-dark)', fontWeight: 600 }}>{t("login.forgot")}</Link>
                        </div>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    {t("login.noAccount")} <Link href="/liity" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{t("login.create")}</Link>
                </p>
            </div>

            <Footer />
        </main>
    );
}
