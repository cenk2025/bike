"use client";

import { useState } from "react";
import { MapPin, Clock, X, Phone, MessageSquare, User, Info } from "lucide-react";

interface BikeCardProps {
    brand: string;
    model: string;
    location: string;
    time: string;
    type: string;
    image: string;
    status?: string;
    description?: string;
    contact_name?: string;
    contact_email?: string;
}

export default function BikeCard({
    brand,
    model,
    location,
    time,
    type,
    image,
    status,
    description,
    contact_name,
    contact_email
}: BikeCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                {status && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: status.toLowerCase() === 'varastettu' ? '#ff1744' : '#00e676',
                        color: status.toLowerCase() === 'varastettu' ? '#fff' : '#000',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        zIndex: 1
                    }}>
                        {status}
                    </div>
                )}
                <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img src={image} alt={`${brand} ${model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{brand} {model}</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{type}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ff1744', fontWeight: 600 }}>
                                <Clock size={14} />
                                {time}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        <MapPin size={14} />
                        {location}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontWeight: 600,
                            color: 'var(--text)',
                            fontSize: '14px'
                        }}
                    >
                        Lisätiedot
                    </button>
                </div>
            </div>

            {/* Premium Detail Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: 0,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', padding: '8px', borderRadius: '50%', color: '#000', zIndex: 10 }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ height: '250px', width: '100%' }}>
                            <img src={image} alt={brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ padding: '32px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <span style={{
                                    backgroundColor: status?.toLowerCase() === 'varastettu' ? '#fee2e2' : '#e8f5e9',
                                    color: status?.toLowerCase() === 'varastettu' ? '#dc2626' : '#2e7d32',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    marginBottom: '12px',
                                    display: 'inline-block'
                                }}>
                                    {status}
                                </span>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{brand} {model}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>{type} • {time}</p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={18} /> Sijainti
                                </h4>
                                <p style={{ color: 'var(--text)', fontSize: '16px' }}>{location}</p>
                            </div>

                            {description && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Info size={18} /> Kuvaus
                                    </h4>
                                    <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.6 }}>{description}</p>
                                </div>
                            )}

                            <div style={{ backgroundColor: '#fcfcfc', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Yhteystiedot</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ backgroundColor: '#eee', padding: '10px', borderRadius: '50%' }}>
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ILMOITTAJA</p>
                                            <p style={{ fontWeight: 700 }}>{contact_name || 'Anonyymi käyttäjä'}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <a href={`mailto:${contact_email || '#'}`} className="primary-button" style={{ flex: 1, justifyContent: 'center', fontSize: '14px', padding: '14px' }}>
                                            <MessageSquare size={18} /> Viesti
                                        </a>
                                        <button className="secondary-button" style={{ flex: 1, justifyContent: 'center', fontSize: '14px', padding: '14px', backgroundColor: '#000' }}>
                                            <Phone size={18} /> Soita
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
