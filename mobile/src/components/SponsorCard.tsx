import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { colors, radius } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { Icon, T } from "./ui";

export interface AdSlot {
    slug: string;
    eyebrow: string | null;
    title: string;
    description: string | null;
    image_url: string | null;
    cta_label: string | null;
    cta_href: string | null;
}

/**
 * Sponsor placement, managed by the admin on the website (public.ad_slots).
 * Always clearly labelled as sponsored.
 */
export default function SponsorCard({ ad, tint = colors.lavender }: { ad: AdSlot; tint?: string }) {
    const { t } = useI18n();
    const open = () => { if (ad.cta_href) Linking.openURL(ad.cta_href); };
    return (
        <Pressable onPress={open} disabled={!ad.cta_href} style={({ pressed }) => [styles.card, { backgroundColor: tint }, pressed && { opacity: 0.9 }]}>
            <View style={styles.tag}>
                <T style={styles.tagText}>{t("m.sponsored").toUpperCase()}</T>
            </View>
            {ad.image_url && <Image source={{ uri: ad.image_url }} style={styles.image} contentFit="contain" />}
            {ad.eyebrow && <T variant="label" style={{ color: colors.maroon, opacity: 0.7 }}>{ad.eyebrow}</T>}
            <T variant="heading">{ad.title}</T>
            {ad.description && <T variant="muted" numberOfLines={3} style={{ color: colors.maroon }}>{ad.description}</T>}
            {ad.cta_href && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <T style={{ fontWeight: "700" }}>{ad.cta_label || t("m.readMore")}</T>
                    <Icon name="arrow.up.right" size={14} />
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: radius.lg, padding: 18, gap: 6, borderWidth: 2, borderColor: colors.maroon },
    tag: { alignSelf: "flex-start", backgroundColor: colors.maroon, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
    tagText: { color: colors.cream, fontSize: 10, letterSpacing: 0.8, fontWeight: "700" },
    image: { width: "100%", aspectRatio: 16 / 9, borderRadius: radius.md, marginVertical: 4, backgroundColor: "rgba(255,255,255,0.5)" }
});
