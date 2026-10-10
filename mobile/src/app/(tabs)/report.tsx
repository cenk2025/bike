import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { colors, radius, shadow } from "@/lib/theme";
import { Icon, IconTile, T } from "@/components/ui";

/** Entry point for all reports. Stolen/register need an account; found does not. */
export default function ReportScreen() {
    const { t } = useI18n();
    const { session } = useAuth();

    const go = (path: "/report/stolen" | "/report/register" | "/report/found", needsLogin: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (needsLogin && !session) {
            router.push({ pathname: "/auth", params: { next: path } });
        } else {
            router.push(path as Href);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }} contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.bg }}>
            <T variant="hero" style={{ marginTop: 28 }}>{t("tab.report")}</T>
            <T variant="muted">{t("m.reportTitle")}</T>

            <Option
                color={colors.accent}
                icon="exclamationmark.triangle.fill"
                title={t("theft.modeStolen")}
                text={t("theft.modeStolenText")}
                badge={session ? undefined : t("m.loginNeeded")}
                onPress={() => go("/report/stolen", true)}
            />
            <Option
                color={colors.purple}
                icon="checkmark.shield.fill"
                title={t("theft.modeRegister")}
                text={t("theft.modeRegisterText")}
                badge={session ? undefined : t("m.loginNeeded")}
                onPress={() => go("/report/register", true)}
            />
            <Option
                color={colors.teal}
                icon="hand.raised.fill"
                title={t("m.found")}
                text={t("m.reportFoundText")}
                onPress={() => go("/report/found", false)}
            />
        </ScrollView>
    );
}

function Option({ color, icon, title, text, badge, onPress }: {
    color: string; icon: Parameters<typeof Icon>[0]["name"]; title: string; text: string; badge?: string; onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.option, pressed && { transform: [{ scale: 0.98 }] }]}>
            <IconTile name={icon} color={color} size={52} />
            <View style={{ flex: 1, gap: 3 }}>
                <T variant="heading">{title}</T>
                <T variant="small" style={{ fontSize: 14, lineHeight: 19 }}>{text}</T>
                {badge && (
                    <View style={styles.badge}>
                        <Icon name="lock.fill" size={10} color={colors.muted} />
                        <T variant="small" style={{ fontSize: 12, lineHeight: 16 }}>{badge}</T>
                    </View>
                )}
            </View>
            <Icon name="chevron.right" size={14} color={colors.faint} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    option: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, ...shadow },
    badge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: colors.field, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 }
});
