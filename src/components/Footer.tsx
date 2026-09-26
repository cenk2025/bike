import Link from "next/link";
import { Bike } from "lucide-react";
import CookieSettingsLink from "./CookieSettingsLink";
import { SITE } from "@/lib/site";

export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#0a0a0a', color: '#fff', padding: '80px 0 40px' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '24px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: 'var(--primary)', padding: '6px', borderRadius: '8px', color: '#000', display: 'flex' }}>
                                <Bike size={24} />
                            </div>
                            CycleFound
                        </div>
                        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>
                            Autamme pyörän omistajia teknologian ja yhteisön avulla – ensin Suomessa, sitten koko Pohjolassa.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Alusta</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/ilmoita-varkaudesta" style={{ color: '#aaa', fontSize: '14px' }}>Ilmoita varkaus</Link></li>
                            <li><Link href="/loydetyt" style={{ color: '#aaa', fontSize: '14px' }}>Löysin pyörän</Link></li>
                            <li><Link href="/tarkista" style={{ color: '#aaa', fontSize: '14px' }}>Tarkista sarjanumero</Link></li>
                            <li><Link href="/tarinat" style={{ color: '#aaa', fontSize: '14px' }}>Onnistumistarinat</Link></li>
                            <li><Link href="/liity" style={{ color: '#aaa', fontSize: '14px' }}>Liity jäseneksi</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Tuki</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/ohjeet" style={{ color: '#aaa', fontSize: '14px' }}>Ohjeet</Link></li>
                            <li><Link href="/ohjeet#turvavinkit" style={{ color: '#aaa', fontSize: '14px' }}>Turvavinkit</Link></li>
                            <li><Link href="/kumppanit" style={{ color: '#aaa', fontSize: '14px' }}>Kumppaneille</Link></li>
                            <li><a href={`mailto:${SITE.email}`} style={{ color: '#aaa', fontSize: '14px' }}>Ota yhteyttä</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Laillinen</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/tietosuoja" style={{ color: '#aaa', fontSize: '14px' }}>Tietosuojaseloste</Link></li>
                            <li><Link href="/kayttoehdot" style={{ color: '#aaa', fontSize: '14px' }}>Käyttöehdot</Link></li>
                            <li><CookieSettingsLink style={{ color: '#aaa', fontSize: '14px' }}>Evästeasetukset</CookieSettingsLink></li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #333', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        © 2026 <a href="https://voon.fi" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>VoonIQ-tuote.</a> Kaikki oikeudet pidätetään.
                    </p>
                </div>
            </div>
        </footer>
    );
}
