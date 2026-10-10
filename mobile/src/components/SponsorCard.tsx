import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { colors, fonts, radius, shadow } from "@/lib/theme";
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
export default function SponsorCard({ ad }: { ad: AdSlot }) {
    const { t } = useI18n();
    const open = () => { if (ad.cta_href) Linking.openURL(ad.cta_href); };
    return (
        <Pressable onPress={open} disabled={!ad.cta_href} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <T style={styles.tag}>{t("m.sponsored")}{ad.eyebrow ? ` · ${ad.eyebrow}` : ""}</T>
                {ad.cta_href && <Icon name="arrow.up.right" size={13} color={colors.muted} />}
            </View>
            {ad.image_url && <Image source={{ uri: ad.image_url }} style={styles.image} contentFit="contain" />}
            <T variant="heading">{ad.title}</T>
            {ad.description && <T variant="muted" numberOfLines={3}>{ad.description}</T>}
            {ad.cta_href && <T style={styles.cta}>{ad.cta_label || t("m.readMore")}</T>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 6, ...shadow },
    tag: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted, letterSpacing: 0.3 },
    image: { width: "100%", aspectRatio: 16 / 9, borderRadius: radius.md, marginVertical: 4, backgroundColor: colors.bg },
    cta: { fontFamily: fonts.semibold, fontSize: 15, color: colors.accent, marginTop: 2 }
});
