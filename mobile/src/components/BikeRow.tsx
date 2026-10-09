import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { bikeTitle, formatRelativeTime, type PublicBike } from "@shared/lib/bikes";
import { colors, radius } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { Icon, StatusBadge, T } from "./ui";

/** Compact list row for a public bike report. Tapping opens the detail screen. */
export default function BikeRow({ bike }: { bike: PublicBike }) {
    const { t, tv } = useI18n();
    const title = bikeTitle(bike, t("card.unknownBike"));
    return (
        <Pressable
            onPress={() => router.push({ pathname: "/bike/[id]", params: { id: String(bike.id) } })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${tv("status", bike.status)}`}
        >
            <View style={styles.thumb}>
                {bike.image_url
                    ? <Image source={{ uri: bike.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                    : <Icon name="bicycle" size={30} color="#c9b8a6" />}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    <StatusBadge status={bike.status} />
                    <T variant="small">{formatRelativeTime(bike.created_at, t)}</T>
                </View>
                <T variant="heading" numberOfLines={1}>{title}</T>
                <T variant="small" numberOfLines={1}>
                    {[tv("type", bike.type), tv("color", bike.color)].filter(Boolean).join(" · ")}
                </T>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="mappin.and.ellipse" size={13} color={colors.muted} />
                    <T variant="small" numberOfLines={1} style={{ flex: 1 }}>{bike.location || bike.city || t("card.unknownLocation")}</T>
                </View>
            </View>
            <Icon name="chevron.right" size={14} color="#c9b8a6" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row", alignItems: "center", gap: 14, padding: 12,
        backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border
    },
    thumb: {
        width: 84, height: 84, borderRadius: radius.md, overflow: "hidden",
        backgroundColor: "#f3ece0", alignItems: "center", justifyContent: "center"
    }
});
