"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Quote, Bike, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StoriesPage() {
    const stories = [
        {
            name: "Heikki H.",
            location: "Helsinki",
            content: "Uskomatonta! Pyöräni löytyi vain kolmessa päivässä CycleFound-yhteisön avulla. Joku näki ilmoitukseni ja tunnisti pyörän kaupan edessä.",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
        },
        {
            name: "Sari K.",
            location: "Tampere",
            content: "Olin jo menettänyt toivoni, mutta sain viestin täältä. Pyöräni oli päätynyt puiston reunaan ja joku ystävällinen sielu ilmoitti siitä!",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
        }
    ];

    return (
        <main style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Header />

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>Menestystarinat</h1>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Nämä tarinat motivoivat meitä jatkamaan työtämme. Yhteisön voima on valtava!
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    {stories.map((story, index) => (
                        <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ color: 'var(--primary-dark)', display: 'flex', gap: '4px' }}>
                                <Star size={20} fill="var(--primary)" />
                                <Star size={20} fill="var(--primary)" />
                                <Star size={20} fill="var(--primary)" />
                                <Star size={20} fill="var(--primary)" />
                                <Star size={20} fill="var(--primary)" />
                            </div>
                            <Quote size={40} style={{ color: 'var(--border)' }} />
                            <p style={{ fontSize: '18px', lineHeight: 1.6, fontStyle: 'italic' }}>"{story.content}"</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                                <img src={story.image} alt={story.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                    <h4 style={{ fontWeight: 700 }}>{story.name}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{story.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '80px', backgroundColor: 'var(--primary)', padding: '60px', borderRadius: '24px', textAlign: 'center', color: '#000' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Onko sinulla oma tarina?</h2>
                    <p style={{ marginBottom: '32px' }}>Haluamme kuulla miten sait pyöräsi takaisin!</p>
                    <button className="primary-button" style={{ backgroundColor: '#000', color: '#fff' }}>
                        Jaa tarinasi <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            <Footer />
        </main>
    );
}
