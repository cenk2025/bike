import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BIKE_COLORS, BIKE_TYPES, CITIES } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { uploadBikePhoto } from "@/lib/upload";
import { COLOR_HEX } from "@/lib/colors";
import { colors, radius } from "@/lib/theme";
import { Card, Chip, ErrorBox, Field, Icon, PillButton, T } from "@/components/ui";

type Kind = "stolen" | "register" | "found";
const MAX_PHOTOS = 4;

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function ReportFormScreen() {
    const { kind: rawKind } = useLocalSearchParams<{ kind: string }>();
    const kind: Kind = rawKind === "register" || rawKind === "found" ? rawKind : "stolen";
    const { session, ready } = useAuth();
    const { t, tv } = useI18n();

    const [form, setForm] = useState({
        serial: "", brand: "", model: "", type: "Kaupunki", color: "", city: "", location: "",
        police: "", description: "", email: session?.user.email ?? ""
    });
    const [date, setDate] = useState(new Date());
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stolen / register need an account – send signed-out users to login first.
    if (kind !== "found" && ready && !session) {
        return <Redirect href={{ pathname: "/auth", params: { next: `/report/${kind}` } }} />;
    }

    const set = (key: keyof typeof form) => (value: string) => setForm(f => ({ ...f, [key]: value }));
    const stolen = kind === "stolen";
    const found = kind === "found";
    const title = found ? t("found.title") : stolen ? t("theft.titleStolen") : t("theft.titleRegister");

    const addPhoto = async (source: "camera" | "library") => {
        const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 1, allowsMultipleSelection: source === "library", selectionLimit: MAX_PHOTOS - photos.length };
        if (source === "camera") {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) return;
        }
        const result = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
        if (result.canceled) return;
        setUploading(true);
        setError(null);
        try {
            const folder = session ? session.user.id : "found";
            const urls: string[] = [];
            for (const asset of result.assets.slice(0, MAX_PHOTOS - photos.length)) {
                urls.push(await uploadBikePhoto(asset, folder));
            }
            setPhotos(p => [...p, ...urls]);
        } catch {
            setError(t("m.error"));
        } finally {
            setUploading(false);
        }
    };

    const valid = (found || form.serial.trim()) && (found || (form.brand.trim() && form.model.trim()))
        && form.city.trim() && form.location.trim();

    const submit = async () => {
        setSaving(true);
        setError(null);
        const status = found ? "ilmoitettu" : stolen ? "varastettu" : "rekisteröity";
        const row: Record<string, unknown> = {
            serial_number: form.serial.trim() || null,
            brand: form.brand.trim() || (found ? "Tuntematon" : null),
            model: form.model.trim() || null,
            type: form.type,
            color: form.color || null,
            city: form.city.trim(),
            location: form.location.trim(),
            event_date: kind === "register" ? null : isoDate(date),
            police_report_number: stolen ? form.police.trim() || null : null,
            description: form.description.trim() || null,
            status,
            image_url: photos[0] ?? null,
            images: photos,
            user_id: session?.user.id ?? null,
            ...(found
                ? { finder_email: form.email.trim() || session?.user.email || null }
                : { allow_contact: true, contact_email: form.email.trim() || session?.user.email || null })
        };
        const { error } = await supabase.from("bikes").insert(row);
        setSaving(false);
        if (error) {
            setError(found ? t("found.saveError", { error: error.message }) : error.message);
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const message = found ? t("found.thanksText") : stolen ? t("m.savedStolen") : t("m.savedRegister");
        Alert.alert(found ? t("found.thanksTitle") : t("m.done"), message, [{
            text: t("m.ok"),
            onPress: () => {
                router.back();
                router.navigate(found ? "/" : "/profile");
            }
        }]);
    };

    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={90}>
            <Stack.Screen options={{ title }} />
            <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
                <T variant="muted">{found ? t("found.intro") : stolen ? t("theft.modeStolenText") : t("theft.modeRegisterText")}</T>
                {error && <ErrorBox message={error} />}

                {/* Photos first – the camera is the fastest way to start */}
                <View style={{ gap: 10 }}>
                    <T variant="label">{t("common.photos")} · {photos.length}/{MAX_PHOTOS}</T>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {photos.map(uri => (
                            <View key={uri}>
                                <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                                <Pressable onPress={() => setPhotos(p => p.filter(x => x !== uri))} style={styles.remove} accessibilityLabel={t("common.removeImage")}>
                                    <Icon name="xmark" size={12} color="#fff" />
                                </Pressable>
                            </View>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <>
                                <PhotoButton icon="camera.fill" label={t("m.takePhoto")} onPress={() => addPhoto("camera")} busy={uploading} />
                                <PhotoButton icon="photo.on.rectangle" label={t("m.pickPhoto")} onPress={() => addPhoto("library")} busy={uploading} />
                            </>
                        )}
                    </ScrollView>
                    <T variant="small">{t("m.photoHint")}</T>
                </View>

                <Card style={{ gap: 16 }}>
                    <Field label={found ? t("found.serial") : t("theft.serial")} placeholder={t("common.egSerial")} value={form.serial}
                        onChangeText={set("serial")} autoCapitalize="characters" autoCorrect={false}
                        hint={found ? t("found.serialHint") : t("theft.serialHint")} />
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <Field containerStyle={{ flex: 1 }} label={found ? t("found.brand") : t("theft.brand")} placeholder={t("common.egBrand")} value={form.brand} onChangeText={set("brand")} />
                        <Field containerStyle={{ flex: 1 }} label={found ? t("found.model") : t("theft.model")} placeholder={t("common.egModel")} value={form.model} onChangeText={set("model")} />
                    </View>

                    <View style={{ gap: 8 }}>
                        <T variant="label">{t("found.type")}</T>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {BIKE_TYPES.map(type => <Chip key={type} label={tv("type", type)} active={form.type === type} onPress={() => set("type")(type)} />)}
                        </ScrollView>
                    </View>

                    <View style={{ gap: 8 }}>
                        <T variant="label">{t("found.color")}</T>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {BIKE_COLORS.map(c => (
                                <Chip key={c} label={tv("color", c)} dot={COLOR_HEX[c]} active={form.color === c} onPress={() => set("color")(form.color === c ? "" : c)} />
                            ))}
                        </ScrollView>
                    </View>

                    <Field label={stolen ? t("theft.marks") : t("found.description")} placeholder={stolen ? t("theft.marksPlaceholder") : t("found.descPlaceholder")}
                        value={form.description} onChangeText={set("description")} multiline />
                </Card>

                <Card style={{ gap: 16 }}>
                    <T variant="heading">{found ? t("found.place") : stolen ? t("theft.placeStolen") : t("theft.placeHome")}</T>
                    <Field label={t("found.city")} placeholder={t("common.egCity")} value={form.city} onChangeText={set("city")} textContentType="addressCity" />
                    {form.city.length > 0 && !CITIES.includes(form.city) && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
                            {CITIES.filter(c => c.toLowerCase().startsWith(form.city.trim().toLowerCase())).slice(0, 6)
                                .map(c => <Chip key={c} label={c} onPress={() => set("city")(c)} />)}
                        </ScrollView>
                    )}
                    <Field label={found ? t("found.location") : stolen ? t("theft.address") : t("theft.area")}
                        placeholder={found ? t("found.locationPlaceholder") : stolen ? t("theft.addressPlaceholder") : t("theft.areaPlaceholder")}
                        value={form.location} onChangeText={set("location")} />
                    {kind !== "register" && (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <T variant="label">{found ? t("found.date") : t("theft.dateStolen")}</T>
                            <DateTimePicker value={date} mode="date" display="compact" maximumDate={new Date()} accentColor={colors.raspberry}
                                onValueChange={(_e, d) => d && setDate(d)} />
                        </View>
                    )}
                    {stolen && (
                        <Field label={t("theft.police")} placeholder="5010/R/12345/26" value={form.police} onChangeText={set("police")}
                            autoCapitalize="characters" hint={t("theft.policeHint")} />
                    )}
                </Card>

                <Card style={{ gap: 12 }}>
                    <T variant="heading">{found ? t("found.contact") : t("theft.notify")}</T>
                    <Field label={found ? t("found.email") : t("theft.email")} placeholder={t("common.egEmail")} value={form.email} onChangeText={set("email")}
                        keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress"
                        hint={found ? t("found.emailHint") : t("theft.contactPrivacy")} />
                </Card>

                <PillButton
                    title={found ? t("found.submit") : stolen ? t("theft.submitStolen") : t("theft.submitRegister")}
                    icon="paperplane.fill"
                    onPress={submit}
                    loading={saving}
                    disabled={!valid || uploading}
                />

                {found && (
                    <View style={{ gap: 6 }}>
                        <T variant="label">{t("found.goodToKnow")}</T>
                        <T variant="small">{t("found.law1")}</T>
                        <T variant="small">{t("found.law2")}</T>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function PhotoButton({ icon, label, onPress, busy }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; onPress: () => void; busy: boolean }) {
    return (
        <Pressable onPress={onPress} disabled={busy} style={({ pressed }) => [styles.photoButton, (pressed || busy) && { opacity: 0.6 }]} accessibilityRole="button">
            {busy ? <ActivityIndicator color={colors.maroon} /> : <Icon name={icon} size={24} />}
            <T variant="small" style={{ color: colors.maroon, textAlign: "center", fontWeight: "600" }}>{label}</T>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    photo: { width: 96, height: 96, borderRadius: radius.md },
    remove: { position: "absolute", top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.red, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
    photoButton: {
        width: 96, height: 96, borderRadius: radius.md, borderWidth: 2, borderStyle: "dashed", borderColor: colors.maroon,
        alignItems: "center", justifyContent: "center", gap: 6, padding: 6, backgroundColor: colors.surface
    }
});
