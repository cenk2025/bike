"use client";

import { ShieldCheck, ArrowRight } from "lucide-react";

export default function FeaturedSections() {
    return (
        <section className="container" style={{ margin: '60px auto', display: 'grid', gap: '32px' }}>
            {/* Insurance Partners */}
            <div style={{ backgroundColor: '#e8f5e9', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--primary)', color: '#000', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Mielenrauha</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>
                    Vakuuta pyöräsi luotettavien kumppaneidemme avulla saadaksesi täyden turvan.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0033a0' }}>LT</div>
                        <div>
                            <h4 style={{ fontSize: '16px' }}>LähiTapiola</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Korvaustuki</p>
                        </div>
                    </div>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#e31e24', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>If</div>
                        <div>
                            <h4 style={{ fontSize: '16px' }}>If-vakuutus</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>24/7 apu</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Partner */}
            <div style={{ backgroundColor: '#121212', borderRadius: '24px', padding: '40px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>PREMIUM-KUMPPANI</p>
                    <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Canyon Bikes</h3>
                    <p style={{ color: '#aaa', marginBottom: '24px', maxWidth: '400px' }}>
                        Saat 10% alennusta CycleFound-jäsenyydellä.
                    </p>
                    <button className="primary-button" style={{ backgroundColor: '#fff', color: '#000' }}>
                        Selaa kauppaa <ArrowRight size={18} />
                    </button>
                </div>
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: 0.1,
                    transform: 'rotate(-15deg)'
                }}>
                    <ShieldCheck size={200} />
                </div>
            </div>
        </section>
    );
}
