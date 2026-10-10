import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { bikeTitle, formatRelativeTime, type PublicBike } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { colors, fonts, STATUS_COLORS } from "@/lib/theme";
import { COLOR_HEX } from "@/lib/colors";
import ContactForm from "@/components/ContactForm";
import PhotoViewer from "@/components/PhotoViewer";
import { Icon, T } from "@/components/ui";

export default function BikeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t, tv, locale } = useI18n();
    const [bike, setBike] = useState<PublicBike | null | undefined>(undefined);
    const { width } = useWindowDimensions();
    // Height follows the first photo's aspect ratio so the whole picture fits.
    const [aspect, setAspect] = useState(4 / 3);
    const [page, setPage] = useState(0);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [contactOpen, setContactOpen] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        supabase.from("bikes_public").select("*").eq("id", id).maybeSingle()
            .then(({ data }) => setBike((data as PublicBike) ?? null));
    }, [id]);

    if (bike === undefined) return <ActivityIndicator style={{ marginTop: 120 }} color={colors.accent} />;
    if (bike === null) return <T variant="muted" style={{ marginTop: 120, textAlign: "center" }}>{t("tag.notFoundTitle")}</T>;

    const title = bikeTitle(bike, t("card.unknownBike"));
    const images = bike.images?.length ? bike.images : bike.image_url ? [bike.image_url] : [];
    const canContact = bike.status === "varastettu" || bike.status === "ilmoitettu";
    const heroHeight = Math.min(Math.max(width / aspect, 240), width * 1.25);

    const statusColor = STATUS_COLORS[bike.status]?.fg ?? colors.muted;
    const swatch = bike.color ? COLOR_HEX[bike.color] : undefined;

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            <ScrollView contentContainerStyle={{ paddingBottom: canContact ? 140 : 48 }}>
                {images.length > 0 ? (
                    <View>
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
                        <View style={styles.expand} pointerEvents="none">
                            <Icon name="arrow.up.left.and.arrow.down.right" size={13} color={colors.text} />
                        </View>
                        {images.length > 1 && (
                            <View style={styles.dots}>
                                {images.map((uri, i) => <View key={uri} style={[styles.dot, i === page && styles.dotActive]} />)}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={[styles.heroEmpty, { width }]}>
                        <Icon name="bicycle" size={72} color={colors.faint} />
                        <T variant="label">{t("common.noImage")}</T>
                    </View>
                )}

                <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 22 }}>
                    <View style={{ gap: 4 }}>
                        <T variant="title" style={{ fontSize: 30, lineHeight: 36 }}>{title}</T>
                        <T style={[styles.status, { color: statusColor }]}>{tv("status", bike.status)}</T>
                        <T variant="muted" style={{ marginTop: 6 }}>{t("card.reported", { time: formatRelativeTime(bike.created_at, t) })}</T>
                    </View>

                    {bike.description && <T variant="muted" style={{ fontSize: 16, lineHeight: 24 }}>{bike.description}</T>}

                    <View style={styles.specs}>
                        <Spec label={t("m.type")} value={tv("type", bike.type) || "–"} />
                        <View style={styles.specDivider} />
                        <Spec label={t("m.color")} value={tv("color", bike.color) || "–"} swatch={swatch} />
                        <View style={styles.specDivider} />
                        <Spec label={t("m.city")} value={bike.city || "–"} />
                    </View>

                    <View style={{ gap: 14 }}>
                        <Info icon="mappin.and.ellipse" text={bike.location || bike.city || t("card.unknownLocation")} />
                        {bike.event_date && (
                            <Info icon="calendar" text={t(bike.status === "ilmoitettu" ? "card.foundOn" : "card.lostOn", {
                                date: new Date(bike.event_date).toLocaleDateString(locale)
                            })} />
                        )}
                        <Info icon="number" text={bike.has_serial ? t("card.serialStored") : t("card.serialNone")} />
                    </View>
                </View>
            </ScrollView>

            {canContact && (
                <View style={[styles.cta, { paddingBottom: insets.bottom + 18 }]}>
                    <T style={styles.ctaText} numberOfLines={2}>{t(bike.status === "varastettu" ? "card.sawIt" : "card.isYours")}</T>
                    <Pressable onPress={() => setContactOpen(true)} style={({ pressed }) => [styles.ctaButton, pressed && { transform: [{ scale: 0.95 }] }]}
                        accessibilityRole="button" accessibilityLabel={t("m.contact")}>
                        <Icon name="paperplane.fill" size={20} color={colors.accent} />
                    </Pressable>
                </View>
            )}

            <Modal visible={contactOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setContactOpen(false)}>
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.surface }}>
                    <ScrollView contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                            <T variant="title" style={{ flex: 1, fontSize: 24, lineHeight: 30 }}>{t(bike.status === "varastettu" ? "card.sawIt" : "card.isYours")}</T>
                            <Pressable onPress={() => setContactOpen(false)} style={styles.close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
                                <Icon name="xmark" size={14} color={colors.text} />
                            </Pressable>
                        </View>
                        <T variant="muted">{t(bike.status === "varastettu" ? "card.sawItText" : "card.isYoursText")}</T>
                        <ContactForm bikeId={bike.id} recipient={bike.status === "varastettu" ? "omistaja" : "löytäjä"} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            <PhotoViewer images={images} index={viewerIndex} onClose={() => setViewerIndex(null)} />
        </View>
    );
}

function Spec({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
    return (
        <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {swatch && <View style={[styles.swatch, { backgroundColor: swatch }]} />}
                <T style={styles.specValue} numberOfLines={1}>{value}</T>
            </View>
            <T variant="small">{label}</T>
        </View>
    );
}

function Info({ icon, text }: { icon: Parameters<typeof Icon>[0]["name"]; text: string }) {
    return (
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View style={styles.infoIcon}><Icon name={icon} size={16} color={colors.text} /></View>
            <T style={{ flex: 1 }}>{text}</T>
        </View>
    );
}

const styles = StyleSheet.create({
    heroEmpty: { height: 260, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.bg },
    expand: {
        position: "absolute", right: 16, top: 12, width: 32, height: 32, borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center"
    },
    dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.faint },
    dotActive: { width: 8, height: 8, borderRadius: 4, marginTop: -1, backgroundColor: colors.accent },
    status: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 26 },
    specs: { flexDirection: "row", gap: 14 },
    specValue: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, flexShrink: 1 },
    specDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border },
    swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" },
    infoIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
    cta: {
        position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 16,
        backgroundColor: colors.accent, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 18
    },
    ctaText: { flex: 1, fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24, color: colors.white },
    ctaButton: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
    close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.field, alignItems: "center", justifyContent: "center" }
});
