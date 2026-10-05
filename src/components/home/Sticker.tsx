type Shape = "flower" | "pill" | "burst" | "wavy";

const FILLS: Record<string, string> = {
    mint: "var(--mint)",
    pink: "var(--pink)",
    lavender: "var(--lavender)",
    yellow: "var(--yellow)"
};

// Star / wavy outline as an SVG polygon in a 100×100 box.
function starPoints(spikes: number, inner: number, outer = 50) {
    const pts: string[] = [];
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI * i) / spikes - Math.PI / 2;
        pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
}

function ShapeSvg({ shape, fill }: { shape: Shape; fill: string }) {
    if (shape === "pill") {
        return <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="50" rx="25" fill={fill} /></svg>;
    }
    if (shape === "flower") {
        const petals = Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 6;
            return <circle key={i} cx={50 + 24 * Math.cos(a)} cy={50 + 24 * Math.sin(a)} r="24" fill={fill} />;
        });
        return <svg viewBox="0 0 100 100" aria-hidden="true">{petals}<circle cx="50" cy="50" r="30" fill={fill} /></svg>;
    }
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <polygon points={shape === "burst" ? starPoints(22, 40) : starPoints(14, 45)} fill={fill} strokeLinejoin="round" />
        </svg>
    );
}

/** A tilted, gently wobbling blob label placed on top of big display type. */
export default function Sticker({
    children, shape, color, size, rotate = 0, style, className
}: {
    children: React.ReactNode;
    shape: Shape;
    color: keyof typeof FILLS;
    size: string;
    rotate?: number;
    style?: React.CSSProperties;
    className?: string;
}) {
    const isPill = shape === "pill";
    return (
        <span
            className={className ? `sticker ${className}` : "sticker"}
            aria-hidden="true"
            style={{
                width: size,
                height: isPill ? `calc(${size} * 0.42)` : size,
                fontSize: `calc(${size} * ${isPill ? 0.19 : 0.17})`,
                padding: isPill ? `0 calc(${size} * 0.08)` : `calc(${size} * 0.18)`,
                ["--rot" as string]: `${rotate}deg`,
                ...style
            }}
        >
            <ShapeSvg shape={shape} fill={FILLS[color]} />
            {children}
        </span>
    );
}
