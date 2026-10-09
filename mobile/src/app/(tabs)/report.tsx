import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { colors, radius } from "@/lib/theme";
import { Icon, T } from "@/components/ui";

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
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.cream }}>
            <T variant="hero" style={{ fontSize: 44, lineHeight: 46, marginTop: 8 }}>{t("tab.report")}</T>
            <T variant="muted">{t("m.reportTitle")}</T>

            <Option
                color={colors.pink}
                icon="exclamationmark.triangle.fill"
                title={t("theft.modeStolen")}
                text={t("theft.modeStolenText")}
                badge={session ? undefined : t("m.loginNeeded")}
                onPress={() => go("/report/stolen", true)}
            />
            <Option
                color={colors.lavender}
                icon="checkmark.shield.fill"
                title={t("theft.modeRegister")}
                text={t("theft.modeRegisterText")}
                badge={session ? undefined : t("m.loginNeeded")}
                onPress={() => go("/report/register", true)}
            />
            <Option
                color={colors.mint}
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
        <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [{ paddingBottom: 6 }, pressed && { transform: [{ translateY: 3 }] }]}>
            <View style={styles.shadow} />
            <View style={[styles.option, { backgroundColor: color }]}>
                <View style={styles.icon}><Icon name={icon} size={26} /></View>
                <View style={{ flex: 1, gap: 4 }}>
                    <T variant="heading" style={{ fontSize: 23, lineHeight: 27 }}>{title}</T>
                    <T style={{ color: colors.maroon, opacity: 0.8 }}>{text}</T>
                    {badge && (
                        <View style={styles.badge}>
                            <Icon name="lock.fill" size={11} />
                            <T style={{ fontSize: 12, fontWeight: "700" }}>{badge}</T>
                        </View>
                    )}
                </View>
                <Icon name="chevron.right" size={16} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    shadow: { position: "absolute", left: 0, right: 0, top: 6, bottom: 0, borderRadius: radius.lg, backgroundColor: colors.maroon },
    option: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.maroon },
    icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.65)", alignItems: "center", justifyContent: "center" },
    badge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.6)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 }
});
