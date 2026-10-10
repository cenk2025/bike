import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { bikeTitle, formatRelativeTime, type PublicBike } from "@shared/lib/bikes";
import { colors, fonts, radius, shadow, STATUS_COLORS } from "@/lib/theme";
import { COLOR_HEX } from "@/lib/colors";
import { useI18n } from "@/lib/i18n";
import { Icon, T } from "./ui";

/** Grid card for a public bike report: photo on top, title, place, status. */
export default function BikeCard({ bike }: { bike: PublicBike }) {
    const { t, tv } = useI18n();
    const title = bikeTitle(bike, t("card.unknownBike"));
    const status = STATUS_COLORS[bike.status];
    const swatch = bike.color ? COLOR_HEX[bike.color] : undefined;
    return (
        <Pressable
            onPress={() => router.push({ pathname: "/bike/[id]", params: { id: String(bike.id) } })}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${tv("status", bike.status)}`}
        >
            <View style={styles.photo}>
                {bike.image_url
                    ? <Image source={{ uri: bike.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                    : <Icon name="bicycle" size={40} color={colors.faint} />}
            </View>
            <View style={{ padding: 12, paddingTop: 10, gap: 2 }}>
                <T style={styles.title} numberOfLines={1}>{title}</T>
                <T variant="small" numberOfLines={1}>{bike.city || bike.location || t("card.unknownLocation")}</T>
                <View style={styles.footer}>
                    <T style={[styles.status, { color: status?.fg ?? colors.muted }]} numberOfLines={1}>{tv("status", bike.status)}</T>
                    {swatch && <View style={[styles.swatch, { backgroundColor: swatch }]} />}
                </View>
                <T style={styles.time} numberOfLines={1}>{formatRelativeTime(bike.created_at, t)}</T>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden", ...shadow },
    photo: { aspectRatio: 1, backgroundColor: colors.field, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21 },
    footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
    status: { fontFamily: fonts.bold, fontSize: 15, flexShrink: 1 },
    swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" },
    time: { fontFamily: fonts.regular, fontSize: 11, color: colors.faint, marginTop: 1 }
});
