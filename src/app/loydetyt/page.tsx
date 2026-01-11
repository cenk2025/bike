"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Info, MapPin, Camera, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function FoundBike() {
    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ maxWidth: '600px', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <Link href="/" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Takaisin</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Löysin pyörän</h1>
                        <Info size={18} />
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Löydetyn pyörän tiedot</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-dark)', backgroundColor: '#e8f5e9', padding: '2px 8px', borderRadius: '4px' }}>1 / 2</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '50%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                </div>

                <div className="card" style={{ padding: '0', border: 'none', background: 'transparent' }}>
                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
                            Pyörän kuvaus
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    MERKKI JA MALLI (JOS TIEDOSSA)
                                </label>
                                <input
                                    type="text"
                                    placeholder="esim. Trek Marlin"
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    VÄRI JA TUNTOMERKIT
                                </label>
                                <textarea
                                    placeholder="Kerro pyörän väri, lisävarusteet tai muut erityispiirteet..."
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '16px', minHeight: '100px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Löytöpaikka</h2>
                        <div style={{
                            height: '200px',
                            backgroundColor: '#eee',
                            borderRadius: '16px',
                            marginBottom: '12px',
                            backgroundImage: 'url("https://api.mapbox.com/styles/v1/mapbox/light-v10/static/24.9384,60.1699,13,0/600x200?access_token=pk.eyJ1IjoiYm90IiwiYSI6ImNrN")',
                            backgroundSize: 'cover',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MapPin size={32} color="var(--primary-dark)" fill="var(--primary)" />
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Merkitse paikka, josta löysit pyörän.</p>
                    </section>

                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Ota kuvia</h2>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)' }}>Max 4</span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ width: '100px', height: '100px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '4px' }}>
                                <Camera size={24} />
                                <span style={{ fontSize: '10px', fontWeight: 700 }}>LISÄÄ</span>
                            </div>
                        </div>
                    </section>

                    <button className="primary-button" style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '16px',
                        justifyContent: 'center',
                        fontSize: '18px',
                        marginBottom: '40px'
                    }}>
                        Ilmoita löydöstä <Send size={20} />
                    </button>

                    <section style={{ backgroundColor: '#e1f5fe', padding: '24px', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={20} color="#0288d1" /> Mitä seuraavaksi?
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                            Tietosi tallennetaan tietokantaamme. Jos pyörä vastaa jotakin varastetuksi ilmoitettua pyörää, otamme sinuun yhteyttä tai opastamme omistajaa ottamaan yhteyttä sinuun. Kiitos kun autat!
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
