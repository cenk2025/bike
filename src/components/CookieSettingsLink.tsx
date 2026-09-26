"use client";

export default function CookieSettingsLink({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', ...style }}
        >
            {children}
        </button>
    );
}
