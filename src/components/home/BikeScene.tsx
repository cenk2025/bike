/**
 * Looping illustration for the hero circle: a bike rides home along a road
 * while a location pin "pings" above it and a FOUND badge pops up.
 * Pure SVG + CSS animations (see globals.css, .scene-*); respects
 * prefers-reduced-motion.
 */

const MAROON = "#3a0b1c";

function Wheel({ cx, cy }: { cx: number; cy: number }) {
    const spokes = [0, 30, 60, 90, 120, 150].map(a => {
        const rad = (a * Math.PI) / 180;
        return (
            <line
                key={a}
                x1={cx - 38 * Math.cos(rad)} y1={cy - 38 * Math.sin(rad)}
                x2={cx + 38 * Math.cos(rad)} y2={cy + 38 * Math.sin(rad)}
                stroke={MAROON} strokeWidth="2" opacity="0.6"
            />
        );
    });
    return (
        <g className="scene-wheel">
            <circle cx={cx} cy={cy} r="42" fill="none" stroke={MAROON} strokeWidth="7" />
            {spokes}
            <circle cx={cx} cy={cy} r="5" fill={MAROON} />
        </g>
    );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
            <ellipse cx="0" cy="0" rx="28" ry="16" />
            <ellipse cx="22" cy="-8" rx="22" ry="18" />
            <ellipse cx="44" cy="2" rx="24" ry="14" />
        </g>
    );
}

function Tree({ x }: { x: number }) {
    return (
        <g transform={`translate(${x} 0)`}>
            <rect x="-4" y="246" width="8" height="46" rx="3" fill={MAROON} />
            <circle cx="0" cy="236" r="26" fill="#7fd3a3" stroke={MAROON} strokeWidth="3" />
        </g>
    );
}

export default function BikeScene({ foundLabel, title }: { foundLabel: string; title: string }) {
    // Every moving layer is drawn twice, 400px apart, so translateX(-400px) loops seamlessly.
    const repeat = [0, 400];
    return (
        <svg viewBox="0 0 400 400" role="img" aria-label={title} style={{ width: '100%', height: '100%', display: 'block' }}>
            <rect width="400" height="400" fill="#fff4d6" />
            <circle cx="318" cy="86" r="30" fill="#ffd84d" />

            <g className="scene-clouds">
                {repeat.map(o => (
                    <g key={o}>
                        <Cloud x={40 + o} y={70} />
                        <Cloud x={210 + o} y={120} s={0.8} />
                    </g>
                ))}
            </g>

            {/* Hills */}
            <path d="M0 270 Q70 200 150 250 T300 240 T400 250 V300 H0 Z" fill="#f9c9de" />

            <g className="scene-trees">
                {repeat.map(o => (
                    <g key={o}>
                        <Tree x={50 + o} />
                        <Tree x={190 + o} />
                        <Tree x={330 + o} />
                    </g>
                ))}
            </g>

            {/* Road */}
            <rect y="292" width="400" height="58" fill="#6d4a58" />
            <line className="scene-road" x1="0" y1="321" x2="400" y2="321" stroke="#ffe27a" strokeWidth="6" strokeDasharray="20 20" />
            <rect y="350" width="400" height="50" fill="#a8e6c1" />

            {/* Radar ping + location pin above the bike */}
            <circle className="scene-ping" cx="200" cy="150" r="30" fill="none" stroke="#e5484d" strokeWidth="4" />
            <g className="scene-pin">
                <path d="M200 176 C188 158 176 146 176 130 a24 24 0 0 1 48 0 C224 146 212 158 200 176 Z" fill="#e5484d" stroke={MAROON} strokeWidth="3" />
                <circle cx="200" cy="130" r="9" fill="#fff4d6" />
            </g>

            {/* FOUND badge */}
            <g className="scene-badge">
                <rect x="250" y="120" width="118" height="44" rx="22" fill="#ffe27a" stroke={MAROON} strokeWidth="3" />
                <text x="309" y="149" textAnchor="middle" style={{ fontFamily: "var(--font-display)" }} fontWeight="700" fontSize="22" fill={MAROON}>{foundLabel}</text>
            </g>

            {/* Bike */}
            <g className="scene-bike">
                <Wheel cx={140} cy={250} />
                <Wheel cx={262} cy={250} />
                <g stroke="#e0407b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <path d="M140 250 L197 254 L182 188 Z" />
                    <path d="M182 188 L248 184 L197 254" />
                    <path d="M248 184 L262 250" />
                </g>
                <g className="scene-crank">
                    <circle cx="197" cy="254" r="11" fill="#ffe27a" stroke={MAROON} strokeWidth="3" />
                    <line x1="197" y1="254" x2="197" y2="272" stroke={MAROON} strokeWidth="5" strokeLinecap="round" />
                </g>
                {/* Seat, handlebar, basket with a heart */}
                <path d="M168 182 h28" stroke={MAROON} strokeWidth="8" strokeLinecap="round" />
                <path d="M246 180 l10 -14 h16" stroke={MAROON} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M258 188 h34 l-6 26 h-24 Z" fill="#ffe27a" stroke={MAROON} strokeWidth="3" strokeLinejoin="round" />
                <path d="M275 205 c-8 -6 -10 -12 -5 -15 c3 -2 5 0 5 2 c0 -2 2 -4 5 -2 c5 3 3 9 -5 15 Z" fill="#e5484d" />
            </g>
        </svg>
    );
}
