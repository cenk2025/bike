import { forwardRef, useState } from "react";
import {
    ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View,
    type PressableProps, type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewStyle
} from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, fonts, radius, STATUS_COLORS } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/* ── Text ─────────────────────────────────────────────────── */
type Variant = "hero" | "title" | "heading" | "body" | "muted" | "small" | "label";

const textStyles = StyleSheet.create({
    hero: { fontFamily: fonts.display, fontSize: 52, lineHeight: 60, color: colors.maroon, textTransform: "uppercase", letterSpacing: -0.5 },
    title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, color: colors.maroon },
    heading: { fontFamily: fonts.displayMedium, fontSize: 21, lineHeight: 26, color: colors.maroon },
    body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.maroon },
    muted: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.muted },
    small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
    label: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, color: colors.muted, textTransform: "uppercase" }
});

export function T({ variant = "body", style, ...rest }: TextProps & { variant?: Variant }) {
    return <Text {...rest} style={[textStyles[variant], style]} />;
}

/* ── Icon (SF Symbols) ────────────────────────────────────── */
export function Icon({ name, size = 20, color = colors.maroon }: { name: SFSymbol; size?: number; color?: string }) {
    return <SymbolView name={name} size={size} tintColor={color} type="hierarchical" />;
}

/* ── Pill button with a solid "pressed" shadow, like the website ── */
export function PillButton({
    title, onPress, icon, color = colors.yellow, loading, disabled, style, small
}: {
    title: string;
    onPress?: PressableProps["onPress"];
    icon?: SFSymbol;
    color?: string;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    small?: boolean;
}) {
    const [pressed, setPressed] = useState(false);
    const off = disabled || loading;
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!off }}
            disabled={off}
            onPressIn={() => { setPressed(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            onPressOut={() => setPressed(false)}
            onPress={onPress}
            style={[{ paddingBottom: 5, opacity: off ? 0.6 : 1 }, style]}
        >
            <View style={[styles.pillShadow, small && { borderRadius: radius.pill }]} />
            <View style={[
                styles.pill,
                small && styles.pillSmall,
                { backgroundColor: color, transform: [{ translateY: pressed ? 4 : 0 }] }
            ]}>
                {loading ? <ActivityIndicator color={colors.maroon} /> : (
                    <>
                        {icon && <Icon name={icon} size={small ? 16 : 19} />}
                        <Text style={[styles.pillText, small && { fontSize: 15 }]}>{title}</Text>
                    </>
                )}
            </View>
        </Pressable>
    );
}

/* ── Chips ────────────────────────────────────────────────── */
export function Chip({ label, active, onPress, dot }: { label: string; active?: boolean; onPress?: () => void; dot?: string }) {
    return (
        <Pressable
            onPress={() => { Haptics.selectionAsync(); onPress?.(); }}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
        >
            {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
            <Text style={[styles.chipText, active && { color: colors.maroon }]}>{label}</Text>
        </Pressable>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const { tv } = useI18n();
    const c = STATUS_COLORS[status] ?? { bg: "#eee", fg: "#333" };
    return (
        <View style={[styles.badge, { backgroundColor: c.bg }]}>
            <Text style={[styles.badgeText, { color: c.fg }]}>{tv("status", status).toUpperCase()}</Text>
        </View>
    );
}

/* ── Inputs ───────────────────────────────────────────────── */
export const Field = forwardRef<TextInput, TextInputProps & { label?: string; hint?: string; containerStyle?: StyleProp<ViewStyle> }>(
    function Field({ label, hint, containerStyle, style, ...rest }, ref) {
        return (
            <View style={[{ gap: 6 }, containerStyle]}>
                {label && <T variant="label">{label}</T>}
                <TextInput
                    ref={ref}
                    placeholderTextColor="#a8919a"
                    {...rest}
                    style={[styles.input, rest.multiline && { minHeight: 96, textAlignVertical: "top", paddingTop: 14 }, style as StyleProp<TextStyle>]}
                />
                {hint && <T variant="small">{hint}</T>}
            </View>
        );
    }
);

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
    return <View style={[styles.card, style]}>{children}</View>;
}

export function ErrorBox({ message }: { message: string }) {
    return (
        <View style={styles.error}>
            <Icon name="exclamationmark.triangle.fill" size={16} color={colors.red} />
            <T style={{ color: "#a11d22", flex: 1 }}>{message}</T>
        </View>
    );
}

const styles = StyleSheet.create({
    pillShadow: { position: "absolute", left: 0, right: 0, top: 5, bottom: 0, backgroundColor: colors.maroon, borderRadius: radius.pill },
    pill: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: radius.pill, borderWidth: 2, borderColor: colors.maroon,
        paddingVertical: 14, paddingHorizontal: 24, minHeight: 54
    },
    pillSmall: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 40 },
    pillText: { fontFamily: fonts.displayMedium, fontSize: 18, lineHeight: 24, color: colors.maroon },
    chip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill,
        backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border
    },
    chipActive: { backgroundColor: colors.yellow, borderColor: colors.maroon },
    chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
    dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" },
    badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.5 },
    input: {
        backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
        paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: fonts.body, color: colors.maroon
    },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, padding: 18 },
    error: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#fde4e4", padding: 12, borderRadius: radius.sm }
});
