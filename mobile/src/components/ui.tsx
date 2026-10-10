import { forwardRef } from "react";
import {
    ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View,
    type PressableProps, type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewStyle
} from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, fonts, radius, shadow, STATUS_COLORS } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/* ── Text ─────────────────────────────────────────────────── */
type Variant = "hero" | "title" | "section" | "heading" | "body" | "muted" | "small" | "label";

const textStyles = StyleSheet.create({
    hero: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, color: colors.text, letterSpacing: -0.6 },
    title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: colors.text, letterSpacing: -0.4 },
    section: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24, color: colors.text },
    heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.text },
    body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.text },
    muted: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted },
    small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
    label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.muted }
});

export function T({ variant = "body", style, ...rest }: TextProps & { variant?: Variant }) {
    return <Text {...rest} style={[textStyles[variant], style]} />;
}

/* ── Icon (SF Symbols) ────────────────────────────────────── */
export function Icon({ name, size = 20, color = colors.text }: { name: SFSymbol; size?: number; color?: string }) {
    return <SymbolView name={name} size={size} tintColor={color} type="hierarchical" />;
}

/** Coloured rounded square with a white symbol (category style). */
export function IconTile({ name, color, size = 44 }: { name: SFSymbol; color: string; size?: number }) {
    return (
        <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
            <Icon name={name} size={size * 0.45} color="#fff" />
        </View>
    );
}

/* ── Button ───────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "soft";
const BUTTON: Record<ButtonVariant, { bg: string; fg: string }> = {
    primary: { bg: colors.accent, fg: colors.white },
    secondary: { bg: colors.field, fg: colors.text },
    soft: { bg: colors.accentSoft, fg: colors.accent }
};

export function Button({
    title, onPress, icon, variant = "primary", loading, disabled, style, small
}: {
    title: string;
    onPress?: PressableProps["onPress"];
    icon?: SFSymbol;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    small?: boolean;
}) {
    const off = disabled || loading;
    const c = BUTTON[variant];
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!off }}
            disabled={off}
            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button, small && styles.buttonSmall,
                { backgroundColor: c.bg, opacity: off ? 0.45 : 1 },
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                style
            ]}
        >
            {loading ? <ActivityIndicator color={c.fg} /> : (
                <>
                    {icon && <Icon name={icon} size={small ? 15 : 18} color={c.fg} />}
                    <Text style={[styles.buttonText, small && { fontSize: 15 }, { color: c.fg }]}>{title}</Text>
                </>
            )}
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
            <Text style={[styles.chipText, active && { color: colors.accent, fontFamily: fonts.semibold }]}>{label}</Text>
        </Pressable>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const { tv } = useI18n();
    const c = STATUS_COLORS[status] ?? { bg: colors.field, fg: colors.muted };
    return (
        <View style={[styles.badge, { backgroundColor: c.bg }]}>
            <Text style={[styles.badgeText, { color: c.fg }]}>{tv("status", status)}</Text>
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
                    placeholderTextColor={colors.muted}
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
            <Icon name="exclamationmark.triangle.fill" size={16} color={colors.accent} />
            <T style={{ color: "#b4161b", flex: 1 }}>{message}</T>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: radius.md, paddingHorizontal: 22, minHeight: 56
    },
    buttonSmall: { minHeight: 42, paddingHorizontal: 16, borderRadius: 13 },
    buttonText: { fontFamily: fonts.semibold, fontSize: 17 },
    chip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.field
    },
    chipActive: { backgroundColor: colors.accentSoft },
    chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
    dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" },
    badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
    badgeText: { fontFamily: fonts.semibold, fontSize: 12 },
    input: {
        backgroundColor: colors.field, borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, fontFamily: fonts.regular, color: colors.text
    },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, ...shadow },
    error: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: colors.accentSoft, padding: 12, borderRadius: 12 }
});
