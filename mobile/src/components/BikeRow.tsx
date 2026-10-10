import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { bikeTitle, formatRelativeTime, type PublicBike } from "@shared/lib/bikes";
import { colors, fonts, radius, shadow, STATUS_COLORS } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { Icon, T } from "./ui";

/** Compact list row for a public bike report. Tapping opens the detail screen. */
export default function BikeRow({ bike }: { bike: PublicBike }) {
    const { t, tv } = useI18n();
    const title = bikeTitle(bike, t("card.unknownBike"));
    return (
        <Pressable
            onPress={() => router.push({ pathname: "/bike/[id]", params: { id: String(bike.id) } })}
            style={({ pressed }) => [styles.row, pressed && { transform: [{ scale: 0.99 }] }]}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${tv("status", bike.status)}`}
        >
            <View style={styles.thumb}>
                {bike.image_url
                    ? <Image source={{ uri: bike.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                    : <Icon name="bicycle" size={28} color={colors.faint} />}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
                <T variant="heading" numberOfLines={1}>{title}</T>
                <T variant="small" numberOfLines={1}>{bike.location || bike.city || t("card.unknownLocation")}</T>
                <T style={[styles.status, { color: STATUS_COLORS[bike.status]?.fg ?? colors.muted }]}>
                    {tv("status", bike.status)} <T variant="small">· {formatRelativeTime(bike.created_at, t)}</T>
                </T>
            </View>
            <Icon name="chevron.right" size={13} color={colors.faint} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 10, backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow },
    thumb: { width: 72, height: 72, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.field, alignItems: "center", justifyContent: "center" },
    status: { fontFamily: fonts.semibold, fontSize: 14, marginTop: 2 }
});
