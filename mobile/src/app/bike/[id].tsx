import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { bikeTitle, formatRelativeTime, type PublicBike } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { colors, radius } from "@/lib/theme";
import ContactForm from "@/components/ContactForm";
import { Card, Icon, StatusBadge, T } from "@/components/ui";

export default function BikeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t, tv, locale } = useI18n();
    const [bike, setBike] = useState<PublicBike | null | undefined>(undefined);
    const { width } = useWindowDimensions();

    useEffect(() => {
        supabase.from("bikes_public").select("*").eq("id", id).maybeSingle()
            .then(({ data }) => setBike((data as PublicBike) ?? null));
    }, [id]);

    if (bike === undefined) return <ActivityIndicator style={{ marginTop: 120 }} color={colors.raspberry} />;
    if (bike === null) return <T variant="muted" style={{ marginTop: 120, textAlign: "center" }}>{t("tag.notFoundTitle")}</T>;

    const title = bikeTitle(bike, t("card.unknownBike"));
    const images = bike.images?.length ? bike.images : bike.image_url ? [bike.image_url] : [];
    const canContact = bike.status === "varastettu" || bike.status === "ilmoitettu";

    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={60}>
            <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
                <View style={styles.hero}>
                    {images.length > 0 ? (
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                            {images.map(uri => (
                                <Image key={uri} source={{ uri }} style={[styles.heroImage, { width }]} contentFit="cover" transition={200} />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={[styles.heroImage, { width, alignItems: "center", justifyContent: "center" }]}>
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
    hero: { backgroundColor: "#f3ece0", borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, overflow: "hidden" },
    heroImage: { height: 340, backgroundColor: "#f3ece0" }
});
