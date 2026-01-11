"use client";

import { MapPin, Clock } from "lucide-react";

interface BikeCardProps {
    image: string;
    brand: string;
    model: string;
    location: string;
    time: string;
    type: string;
    status?: string;
}

export default function BikeCard({ image, brand, model, location, time, type, status }: BikeCardProps) {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            {status && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#ff1744',
                    color: '#fff',
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

                <button style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '14px'
                }}>
                    Lisätiedot
                </button>
            </div>
        </div>
    );
}
