"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Quote, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Story {
    id: string;
    full_name: string;
    location: string;
    content: string;
    created_at: string;
}

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setStories(data);
            }
            setLoading(false);
        };
        fetchStories();
    }, []);

    const avatarUrl = (name: string) =>
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8bc34a&color=fff&bold=true&size=96`;

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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '18px' }}>
                        Ladataan tarinoita...
                    </div>
                ) : stories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}>
                        <BookOpen size={56} style={{ color: 'var(--border)', marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '24px' }}>
                            Ei vielä tarinoita. Ole ensimmäinen!
                        </p>
                        <Link href="/dashboard#tarinat" className="primary-button" style={{ borderRadius: '12px', display: 'inline-flex' }}>
                            Jaa tarinasi <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {stories.map((story) => (
                            <div key={story.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={avatarUrl(story.full_name)}
                                        alt={story.full_name}
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h4 style={{ fontWeight: 700 }}>{story.full_name}</h4>
                                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{story.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div style={{ marginTop: '80px', backgroundColor: 'var(--primary)', padding: '60px', borderRadius: '24px', textAlign: 'center', color: '#000' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Onko sinulla oma tarina?</h2>
                    <p style={{ marginBottom: '32px' }}>Haluamme kuulla miten sait pyöräsi takaisin!</p>
                    <Link href="/dashboard#tarinat" className="primary-button" style={{ backgroundColor: '#000', color: '#fff', display: 'inline-flex', borderRadius: '12px' }}>
                        Jaa tarinasi <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
