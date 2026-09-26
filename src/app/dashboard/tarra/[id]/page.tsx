"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { bikeTitle } from "@/lib/bikes";
import { SITE } from "@/lib/site";

const STICKERS_PER_SHEET = 8;

/**
 * Printable A4 sheet of QR stickers for one bike. Each sticker links to
 * bike.voon.fi/q/<tag_code>.
 */
export default function StickerSheetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [bike, setBike] = useState<{ brand: string | null; model: string | null; tag_code: string } | null>(null);
    const [qr, setQr] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/kirjaudu?next=${encodeURIComponent(`/dashboard/tarra/${id}`)}`);
                return;
            }
            const { data, error } = await supabase.from("bikes").select("brand, model, tag_code").eq("id", id).maybeSingle();
            if (error || !data?.tag_code) {
                setError("Pyörää ei löytynyt tai tunniste puuttuu. Aja tietokantapäivitys 2026-09-27.");
                return;
            }
            setBike(data);
            setQr(await QRCode.toDataURL(`${SITE.url}/q/${data.tag_code}`, { margin: 1, width: 400, errorCorrectionLevel: "M" }));
        })();
    }, [id, router]);

    return (
        <main style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 10mm; }
                }
                .sticker-sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; }
                .sticker { border: 1px dashed #bbb; border-radius: 4mm; padding: 4mm; display: flex; gap: 4mm; align-items: center; break-inside: avoid; }
            `}</style>

            <div className="no-print container" style={{ padding: '32px 24px 16px', maxWidth: '800px' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: 600, marginBottom: '20px' }}>
                    <ArrowLeft size={20} /> Takaisin
                </Link>
                <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>QR-tarrat{bike ? `: ${bikeTitle(bike)}` : ''}</h1>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                    Tulosta arkki tarrapaperille tai tavalliselle paperille ja kiinnitä läpinäkyvällä teipillä. Liimaa
                    yksi tarra näkyvälle paikalle (esim. satulaputkeen) ja yksi piiloon – esimerkiksi satulan alle
                    tai tavaratelineeseen. Löytäjä skannaa koodin ja voi lähettää sinulle viestin ilman käyttäjätiliä.
                </p>
                {error && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}
                {qr && (
                    <button className="primary-button" onClick={() => window.print()} style={{ marginBottom: '24px' }}>
                        <Printer size={18} /> Tulosta
                    </button>
                )}
            </div>

            {qr && bike && (
                <div className="container sticker-sheet" style={{ maxWidth: '800px', paddingBottom: '40px' }}>
                    {Array.from({ length: STICKERS_PER_SHEET }, (_, i) => (
                        <div key={i} className="sticker">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qr} alt="QR-koodi" style={{ width: '32mm', height: '32mm' }} />
                            <div style={{ fontFamily: 'var(--font-outfit)', lineHeight: 1.25 }}>
                                <div style={{ fontWeight: 800, fontSize: '13pt' }}>Löysitkö tämän pyörän?</div>
                                <div style={{ fontSize: '9pt', margin: '1.5mm 0' }}>Skannaa koodi ja ilmoita omistajalle.</div>
                                <div style={{ fontSize: '8pt', color: '#555' }}>Hittade du cykeln? · Found this bike?</div>
                                <div style={{ fontWeight: 800, fontSize: '10pt', marginTop: '2mm' }}>CycleFound</div>
                                <div style={{ fontSize: '8pt', color: '#555' }}>bike.voon.fi/q/{bike.tag_code}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
