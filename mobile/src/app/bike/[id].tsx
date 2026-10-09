import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { bikeTitle, formatRelativeTime, type PublicBike } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { colors, radius } from "@/lib/theme";
import ContactForm from "@/components/ContactForm";
import PhotoViewer from "@/components/PhotoViewer";
import { Card, Icon, StatusBadge, T } from "@/components/ui";

export default function BikeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t, tv, locale } = useI18n();
    const [bike, setBike] = useState<PublicBike | null | undefined>(undefined);
    const { width } = useWindowDimensions();
    // Height follows the first photo's aspect ratio so the whole picture fits.
    const [aspect, setAspect] = useState(4 / 3);
    const [page, setPage] = useState(0);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    useEffect(() => {
        supabase.from("bikes_public").select("*").eq("id", id).maybeSingle()
            .then(({ data }) => setBike((data as PublicBike) ?? null));
    }, [id]);

    if (bike === undefined) return <ActivityIndicator style={{ marginTop: 120 }} color={colors.raspberry} />;
    if (bike === null) return <T variant="muted" style={{ marginTop: 120, textAlign: "center" }}>{t("tag.notFoundTitle")}</T>;

    const title = bikeTitle(bike, t("card.unknownBike"));
    const images = bike.images?.length ? bike.images : bike.image_url ? [bike.image_url] : [];
    const canContact = bike.status === "varastettu" || bike.status === "ilmoitettu";
    const heroHeight = Math.min(Math.max(width / aspect, 240), width * 1.25);

    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={60}>
            <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
                <View style={styles.hero}>
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
                            >
                                {images.map((uri, i) => (
                                    <Pressable key={uri} onPress={() => setViewerIndex(i)} accessibilityRole="imagebutton" accessibilityLabel={title}>
                                        <Image
                                            source={{ uri }}
                                            style={{ width, height: heroHeight }}
                                            contentFit="contain"
                                            transition={200}
                                            onLoad={i === 0 ? e => e.source.height > 0 && setAspect(e.source.width / e.source.height) : undefined}
                                        />
                                    </Pressable>
                                ))}
                            </ScrollView>
                            <View style={styles.heroBadge} pointerEvents="none">
                                <Icon name="arrow.up.left.and.arrow.down.right" size={13} color="#fff" />
                                {images.length > 1 && <T style={styles.heroBadgeText}>{page + 1}/{images.length}</T>}
                            </View>
                        </>
                    ) : (
                        <View style={[styles.heroEmpty, { width }]}>
                            <Icon name="bicycle" size={72} color="#c9b8a6" />
                            <T variant="label">{t("common.noImage")}</T>
                        </View>
                    )}
                </View>

                <View style={{ padding: 20, gap: 18 }}>
                    <View style={{ gap: 8 }}>
                        <StatusBadge status={bike.status} />
                        <T variant="title">{title}</T>
                        <T variant="muted">
                            {[tv("type", bike.type), t("card.reported", { time: formatRelativeTime(bike.created_at, t) })].filter(Boolean).join(" · ")}
                        </T>
                    </View>

                    <Card style={{ gap: 12 }}>
                        <Info icon="mappin.and.ellipse" text={bike.location || bike.city || t("card.unknownLocation")} />
                        {bike.color && <Info icon="paintpalette" text={tv("color", bike.color)} />}
                        {bike.event_date && (
                            <Info icon="calendar" text={t(bike.status === "ilmoitettu" ? "card.foundOn" : "card.lostOn", {
                                date: new Date(bike.event_date).toLocaleDateString(locale)
                            })} />
                        )}
                        <Info icon="number" text={bike.has_serial ? t("card.serialStored") : t("card.serialNone")} />
                    </Card>

                    {bike.description && (
                        <View style={{ gap: 6 }}>
                            <T variant="label">{t("card.description")}</T>
                            <T>{bike.description}</T>
                        </View>
                    )}

                    {canContact && (
                        <Card style={{ gap: 12, borderColor: colors.maroon, borderWidth: 2 }}>
                            <T variant="heading">{t(bike.status === "varastettu" ? "card.sawIt" : "card.isYours")}</T>
                            <T variant="muted">{t(bike.status === "varastettu" ? "card.sawItText" : "card.isYoursText")}</T>
                            <ContactForm bikeId={bike.id} recipient={bike.status === "varastettu" ? "omistaja" : "löytäjä"} />
                        </Card>
                    )}
                </View>
            </ScrollView>
            <PhotoViewer images={images} index={viewerIndex} onClose={() => setViewerIndex(null)} />
        </KeyboardAvoidingView>
    );
}

function Info({ icon, text }: { icon: Parameters<typeof Icon>[0]["name"]; text: string }) {
    return (
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Icon name={icon} size={18} color={colors.raspberry} />
            <T style={{ flex: 1 }}>{text}</T>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: { backgroundColor: "#efe6d6", borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, overflow: "hidden" },
    heroEmpty: { height: 260, alignItems: "center", justifyContent: "center", gap: 6 },
    heroBadge: {
        position: "absolute", right: 14, bottom: 14, flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(58,11,28,0.7)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999
    },
    heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" }
});
