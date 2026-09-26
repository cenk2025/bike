"use client";

import { useState } from "react";
import { MapPin, Clock, X, Info, Palette, Calendar, Hash } from "lucide-react";
import ContactForm from "./ContactForm";
import { bikeTitle, formatRelativeTime, statusStyle, type PublicBike } from "@/lib/bikes";
import { useI18n } from "@/i18n/I18nProvider";

function BikeImage({ src, alt, height, iconSize }: { src: string | null; alt: string; height: string; iconSize: number }) {
    const { t } = useI18n();
    return (
        <div style={{ height, width: '100%', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#bbb' }}>
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 8l-3 4.5h11l-4-7.5" /></svg>
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{t("common.noImage")}</span>
                </div>
            )}
        </div>
    );
}

export default function BikeCard({ bike }: { bike: PublicBike }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t, tv, locale } = useI18n();
    const title = bikeTitle(bike, t("card.unknownBike"));
    const status = statusStyle(bike.status);
    const statusLabel = tv("status", bike.status);
    const location = bike.location || bike.city || t("card.unknownLocation");
    const time = formatRelativeTime(bike.created_at, t);
    const typeLabel = tv("type", bike.type);
    const colorLabel = tv("color", bike.color);

    return (
        <>
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 1,
                    backgroundColor: status.solidBg, color: status.solidFg,
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'
                }}>
                    {statusLabel}
                </div>
                {bike.is_demo && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                        DEMO
                    </div>
                )}
                <BikeImage src={bike.image_url} alt={title} height="200px" iconSize={48} />
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                {[typeLabel, colorLabel].filter(Boolean).join(" • ")}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: status.fg, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            <Clock size={14} />
                            {time}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        <MapPin size={14} />
                        {location}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#f5f5f5', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}
                    >
                        {t("card.details")}
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                >
                    <div
                        className="card"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        style={{ width: '100%', maxWidth: '500px', padding: 0, maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'slideDown 0.3s ease' }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            aria-label={t("common.close")}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', padding: '8px', borderRadius: '50%', color: '#000', zIndex: 10 }}
                        >
                            <X size={20} />
                        </button>

                        <BikeImage src={bike.image_url} alt={title} height="250px" iconSize={64} />

                        <div style={{ padding: '32px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ backgroundColor: status.bg, color: status.fg, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px', display: 'inline-block', textTransform: 'uppercase' }}>
                                    {statusLabel}
                                </span>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{title}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>{[typeLabel, t("card.reported", { time })].filter(Boolean).join(" • ")}</p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '24px', display: 'grid', gap: '12px' }}>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> {location}</p>
                                {bike.color && <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Palette size={18} /> {colorLabel}</p>}
                                {bike.event_date && (
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={18} /> {t(bike.status === 'ilmoitettu' ? "card.foundOn" : "card.lostOn", { date: new Date(bike.event_date).toLocaleDateString(locale) })}
                                    </p>
                                )}
                                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    <Hash size={18} /> {bike.has_serial ? t("card.serialStored") : t("card.serialNone")}
                                </p>
                            </div>

                            {bike.description && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Info size={18} /> {t("card.description")}
                                    </h4>
                                    <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.6 }}>{bike.description}</p>
                                </div>
                            )}

                            {(bike.status === 'varastettu' || bike.status === 'ilmoitettu') && (
                                <div style={{ backgroundColor: '#fcfcfc', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                                        {t(bike.status === 'varastettu' ? "card.sawIt" : "card.isYours")}
                                    </h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                                        {t(bike.status === 'varastettu' ? "card.sawItText" : "card.isYoursText")}
                                    </p>
                                    <ContactForm bikeId={bike.id} recipient={bike.status === 'varastettu' ? 'omistaja' : 'löytäjä'} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
