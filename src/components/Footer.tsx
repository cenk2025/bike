import Link from "next/link";
import { Bike, Instagram, Twitter, Facebook } from "lucide-react";

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
                            Autamme pyörän omistajia teknologian ja yhteisön avulla koko Euroopassa.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Alusta</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/ilmoita-varkaudesta" style={{ color: '#aaa', fontSize: '14px' }}>Kadonneet pyörät</Link></li>
                            <li><Link href="/tarinat" style={{ color: '#aaa', fontSize: '14px' }}>Onnistumistarinat</Link></li>
                            <li><Link href="/liity" style={{ color: '#aaa', fontSize: '14px' }}>Liity jäseneksi</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Tuki</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="#" style={{ color: '#aaa', fontSize: '14px' }}>Ohjekeskus</Link></li>
                            <li><Link href="#" style={{ color: '#aaa', fontSize: '14px' }}>Ota yhteyttä</Link></li>
                            <li><Link href="#" style={{ color: '#aaa', fontSize: '14px' }}>Turvavinkit</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Laillinen</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="#" style={{ color: '#aaa', fontSize: '14px' }}>Tietosuojaseloste</Link></li>
                            <li><Link href="#" style={{ color: '#aaa', fontSize: '14px' }}>Käyttöehdot</Link></li>
                            <li><Link href="#" style={{ color: '#aaa', fontSize: '14px' }}>Evästeasetukset</Link></li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #333', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        © 2026 <a href="https://voon.fi" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>VoonIQ ürünüdür.</a> Kaikki oikeudet pidätetään.
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link href="#" style={{ color: '#666' }}><Twitter size={20} /></Link>
                        <Link href="#" style={{ color: '#666' }}><Instagram size={20} /></Link>
                        <Link href="#" style={{ color: '#666' }}><Facebook size={20} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
