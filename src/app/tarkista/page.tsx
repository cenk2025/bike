"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, ShieldAlert, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { bikeTitle } from "@/lib/bikes";
import { useI18n } from "@/i18n/I18nProvider";

interface CheckResult {
    status: "varastettu" | "ilmoitettu" | "rekisteröity";
    brand: string | null;
    model: string | null;
    type: string | null;
    color: string | null;
    city: string | null;
    event_date: string | null;
    reported_at: string;
}

/**
 * "Tarkista ennen ostoa" – lets a second-hand buyer check a serial number
 * against stolen / found / registered bikes. Reveals no personal data.
 */
export default function CheckSerialPage() {
    const [serial, setSerial] = useState("");
    const [checked, setChecked] = useState<string | null>(null);
    const [results, setResults] = useState<CheckResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t, tv, locale } = useI18n();

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = serial.trim();
        if (value.length < 4) {
            setError(t("check.errShort"));
            return;
        }
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.rpc("check_serial", { p_serial: value });
        setLoading(false);
        if (error) {
            setError(t("check.errFail"));
            return;
        }
        setResults((data ?? []) as CheckResult[]);
        setChecked(value);
    };

    const stolen = results.find(r => r.status === "varastettu");
    const registered = results.find(r => r.status === "rekisteröity");
    const found = results.find(r => r.status === "ilmoitettu");

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '640px', padding: '60px 24px' }}>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: '12px', lineHeight: 1.1 }}>
                    {t("check.title")}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '17px', marginBottom: '32px', lineHeight: 1.6 }}>
                    {t("check.intro")}
                </p>

                <form onSubmit={handleCheck} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={serial}
                        onChange={e => setSerial(e.target.value)}
                        placeholder={t("check.placeholder")}
                        aria-label={t("check.aria")}
                        autoComplete="off"
                        style={{ flex: '1 1 240px', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '17px', fontFamily: 'inherit' }}
                    />
                    <button type="submit" className="primary-button" disabled={loading} style={{ padding: '18px 28px', borderRadius: '14px', fontSize: '17px', opacity: loading ? 0.7 : 1 }}>
                        <Search size={20} /> {loading ? t("check.checking") : t("check.button")}
                    </button>
                </form>

                {error && <p style={{ color: '#dc2626', marginBottom: '24px' }}>{error}</p>}

                {checked && !loading && (
                    <div style={{ marginBottom: '40px' }}>
                        {stolen ? (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid #dc2626', backgroundColor: '#fff5f5' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <ShieldAlert size={26} /> {t("check.stolenTitle")}
                                </h2>
                                <p style={{ marginBottom: '12px', lineHeight: 1.6 }}>
                                    <strong>{bikeTitle(stolen, t("card.unknownBike"))}</strong>
                                    {[tv("type", stolen.type), tv("color", stolen.color)].filter(Boolean).length > 0 && ` (${[tv("type", stolen.type), tv("color", stolen.color)].filter(Boolean).join(', ')})`}
                                    {stolen.city && `, ${stolen.city}`}
                                    {stolen.event_date && ` – ${t("check.stolenOn", { date: new Date(stolen.event_date).toLocaleDateString(locale) })}`}.
                                </p>
                                <p style={{ lineHeight: 1.6 }}>
                                    <strong>{t("check.dontBuy")}</strong> {t("check.dontBuyText")}
                                </p>
                            </div>
                        ) : registered ? (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid #8e24aa' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Info size={26} color="#8e24aa" /> {t("check.registeredTitle")}
                                </h2>
                                <p style={{ lineHeight: 1.6 }}>
                                    {t("check.registeredText", { bike: bikeTitle(registered, t("card.unknownBike")) })}
                                </p>
                            </div>
                        ) : found ? (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid #2e7d32' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Info size={26} color="#2e7d32" /> {t("check.foundTitle")}
                                </h2>
                                <p style={{ lineHeight: 1.6 }}>
                                    {t("check.foundText", { bike: bikeTitle(found, t("card.unknownBike")) + (found.city ? `, ${found.city}` : '') })}
                                </p>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid var(--primary)' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <ShieldCheck size={26} color="var(--primary-dark)" /> {t("check.noneTitle")}
                                </h2>
                                <p style={{ lineHeight: 1.6 }}>
                                    {t("check.noneText", { serial: checked })}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <section className="card" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{t("check.tipsTitle")}</h2>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
                        {([t("check.tip1"), t("check.tip2"), t("check.tip3"), t("check.tip4"), t("check.tip5")]).map(tip => (
                            <li key={tip} style={{ display: 'flex', gap: '10px', lineHeight: 1.5 }}>
                                <CheckCircle2 size={18} color="var(--primary-dark)" style={{ flexShrink: 0, marginTop: '2px' }} /> {tip}
                            </li>
                        ))}
                    </ul>
                    <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        {t("check.ownerA")} <Link href="/ilmoita-varkaudesta?tila=rekisteroi" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{t("check.ownerLink")}</Link>{" "}
                        {t("check.ownerB")}
                    </p>
                </section>
            </div>

            <Footer />
        </main>
    );
}
