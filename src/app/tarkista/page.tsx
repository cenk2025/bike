"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, ShieldAlert, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { bikeTitle } from "@/lib/bikes";

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

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = serial.trim();
        if (value.length < 4) {
            setError("Anna koko sarjanumero (vähintään 4 merkkiä).");
            return;
        }
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.rpc("check_serial", { p_serial: value });
        setLoading(false);
        if (error) {
            setError("Tarkistus epäonnistui. Yritä uudelleen.");
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
                    Tarkista ennen kuin ostat
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '17px', marginBottom: '32px', lineHeight: 1.6 }}>
                    Ostamassa käytettyä pyörää Tori.fi:stä tai Marketplacesta? Tarkista sarjanumero ilmaiseksi –
                    näet heti, onko pyörä ilmoitettu varastetuksi.
                </p>

                <form onSubmit={handleCheck} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={serial}
                        onChange={e => setSerial(e.target.value)}
                        placeholder="Sarjanumero tai runkonumero"
                        aria-label="Sarjanumero"
                        autoComplete="off"
                        style={{ flex: '1 1 240px', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '17px', fontFamily: 'inherit' }}
                    />
                    <button type="submit" className="primary-button" disabled={loading} style={{ padding: '18px 28px', borderRadius: '14px', fontSize: '17px', opacity: loading ? 0.7 : 1 }}>
                        <Search size={20} /> {loading ? "Tarkistetaan..." : "Tarkista"}
                    </button>
                </form>

                {error && <p style={{ color: '#dc2626', marginBottom: '24px' }}>{error}</p>}

                {checked && !loading && (
                    <div style={{ marginBottom: '40px' }}>
                        {stolen ? (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid #dc2626', backgroundColor: '#fff5f5' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <ShieldAlert size={26} /> Ilmoitettu varastetuksi
                                </h2>
                                <p style={{ marginBottom: '12px', lineHeight: 1.6 }}>
                                    <strong>{bikeTitle(stolen)}</strong>
                                    {[stolen.type, stolen.color].filter(Boolean).length > 0 && ` (${[stolen.type, stolen.color].filter(Boolean).join(', ')})`}
                                    {stolen.city && `, ${stolen.city}`}
                                    {stolen.event_date && ` – varastettu ${new Date(stolen.event_date).toLocaleDateString('fi-FI')}`}.
                                </p>
                                <p style={{ lineHeight: 1.6 }}>
                                    <strong>Älä osta pyörää.</strong> Varastetun tavaran ostaminen voi olla rikos (kätkemisrikos).
                                    Älä kohtaa myyjää yksin – ilmoita myynti-ilmoituksesta poliisille ja lähetä omistajalle viesti
                                    pyörän ilmoituksen kautta etusivun haulla.
                                </p>
                            </div>
                        ) : registered ? (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid #8e24aa' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Info size={26} color="#8e24aa" /> Rekisteröity omistajalle
                                </h2>
                                <p style={{ lineHeight: 1.6 }}>
                                    Tämä pyörä ({bikeTitle(registered)}) on rekisteröity CycleFoundiin. Sitä ei ole ilmoitettu
                                    varastetuksi. Pyydä myyjältä todiste omistajuudesta – rehellinen myyjä voi siirtää pyörän sinulle.
                                </p>
                            </div>
                        ) : found ? (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid #2e7d32' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Info size={26} color="#2e7d32" /> Ilmoitettu löydetyksi
                                </h2>
                                <p style={{ lineHeight: 1.6 }}>
                                    Joku on ilmoittanut löytäneensä tämän pyörän ({bikeTitle(found)}{found.city ? `, ${found.city}` : ''}).
                                    Löydetty pyörä kuuluu edelleen omistajalleen, eikä sitä saa myydä.
                                </p>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '28px', borderLeft: '6px solid var(--primary)' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <ShieldCheck size={26} color="var(--primary-dark)" /> Ei ilmoituksia
                                </h2>
                                <p style={{ lineHeight: 1.6 }}>
                                    Sarjanumerolla <strong>{checked}</strong> ei ole varkaus- tai löytöilmoituksia CycleFoundissa.
                                    Tämä ei takaa, ettei pyörä olisi varastettu – kaikkia varkauksia ei ilmoiteta tänne.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <section className="card" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Näin ostat käytetyn pyörän turvallisesti</h2>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
                        {[
                            "Tarkista sarjanumero itse rungosta – älä luota myyjän ilmoittamaan numeroon.",
                            "Pyydä ostokuitti tai muu todiste omistajuudesta.",
                            "Epäile, jos hinta on selvästi alle markkinahinnan tai myyjällä on kiire.",
                            "Viilattu tai peitetty sarjanumero on vahva varoitusmerkki.",
                            "Tee kauppa päivänvalossa ja pyydä kuitti myyjän nimellä."
                        ].map(tip => (
                            <li key={tip} style={{ display: 'flex', gap: '10px', lineHeight: 1.5 }}>
                                <CheckCircle2 size={18} color="var(--primary-dark)" style={{ flexShrink: 0, marginTop: '2px' }} /> {tip}
                            </li>
                        ))}
                    </ul>
                    <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Omistatko pyörän? <Link href="/ilmoita-varkaudesta?tila=rekisteroi" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Rekisteröi se ennakkoon</Link> –
                        jos se joskus katoaa, kaikki tiedot ovat valmiina.
                    </p>
                </section>
            </div>

            <Footer />
        </main>
    );
}
