import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { bikeTitle } from "@shared/lib/bikes";
import { supabase, WEB_URL } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS, type Key } from "@/lib/i18n";
import { colors, radius } from "@/lib/theme";
import RadarLogo from "@/components/RadarLogo";
import SponsorCard, { type AdSlot } from "@/components/SponsorCard";
import { Card, Chip, Icon, PillButton, StatusBadge, T } from "@/components/ui";

interface MyBike { id: string; brand: string | null; model: string | null; status: string; serial_number: string | null; image_url: string | null }
interface Match {
    match_id: number; score: number; reasons: string[]; match_status: "uusi" | "vahvistettu" | "hylatty";
    my_role: "omistaja" | "löytäjä"; my_bike_id: string; my_bike_label: string;
    other_bike_id: string; other_brand: string | null; other_model: string | null; other_location: string | null; other_city: string | null; other_image_url: string | null;
}
interface Message { id: number; sender_name: string; sender_email: string; sender_phone: string | null; body: string; read_at: string | null; created_at: string; bikes: { brand: string | null; model: string | null } | null }

export default function ProfileScreen() {
    const { session } = useAuth();
    const { t } = useI18n();
    const [ad, setAd] = useState<AdSlot | null>(null);

    useEffect(() => {
        supabase.from("ad_slots").select("*").then(({ data }) => setAd((data?.[data.length - 1] as AdSlot) ?? null));
    }, []);

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: 48 }} contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.cream }}>
            {session ? <SignedIn /> : (
                <Card style={{ alignItems: "center", gap: 10, paddingVertical: 26 }}>
                    <RadarLogo size={56} />
                    <T variant="title" style={{ textAlign: "center" }}>{t("m.guestTitle")}</T>
                    <T variant="muted" style={{ textAlign: "center" }}>{t("m.guestText")}</T>
                    <PillButton title={t("login.submit")} icon="person.crop.circle" onPress={() => router.push("/auth")} style={{ alignSelf: "stretch", marginTop: 6 }} />
                </Card>
            )}

            {ad && <SponsorCard ad={ad} tint={colors.pink} />}
            <Settings />
        </ScrollView>
    );
}

function SignedIn() {
    const { session } = useAuth();
    const { t, tv } = useI18n();
    const [bikes, setBikes] = useState<MyBike[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const userId = session!.user.id;

    const load = useCallback(async () => {
        const [b, m, msg] = await Promise.all([
            supabase.from("bikes").select("id, brand, model, status, serial_number, image_url").eq("user_id", userId).order("created_at", { ascending: false }),
            supabase.rpc("my_matches"),
            supabase.from("bike_messages")
                .select("id, sender_name, sender_email, sender_phone, body, read_at, created_at, bikes!inner(brand, model, user_id)")
                .eq("bikes.user_id", userId).order("created_at", { ascending: false }).limit(50)
        ]);
        if (b.data) setBikes(b.data as MyBike[]);
        if (m.data) setMatches((m.data as Match[]).filter(x => x.match_status !== "hylatty"));
        if (msg.data) setMessages(msg.data as unknown as Message[]);
    }, [userId]);

    // Reload whenever the tab comes into focus (e.g. right after a new report).
    useFocusEffect(useCallback(() => { load(); }, [load]));

    const setMatch = async (id: number, status: "vahvistettu" | "hylatty") => {
        await supabase.from("bike_matches").update({ status }).eq("id", id);
        load();
    };

    const setBikeStatus = async (id: string, status: "löytynyt" | "varastettu") => {
        const patch = status === "varastettu" ? { status, event_date: new Date().toISOString().slice(0, 10) } : { status };
        const { error } = await supabase.from("bikes").update(patch).eq("id", id);
        if (error) Alert.alert(t("m.error"), error.message);
        load();
    };

    const name = (session!.user.user_metadata?.full_name as string) || t("dash.user");

    return (
        <View style={{ gap: 22 }}>
            <View>
                <T variant="hero" style={{ fontSize: 40, lineHeight: 44 }}>{t("dash.hello", { name })}</T>
                <T variant="muted">{session!.user.email}</T>
            </View>

            <View style={{ gap: 10 }}>
                <T variant="title" style={{ fontSize: 26 }}>{t("matches.title", { n: matches.length })}</T>
                {matches.length === 0 ? <T variant="muted">{t("m.noMatches")}</T> : matches.map(m => (
                    <Card key={m.match_id} style={{ gap: 10, borderColor: colors.maroon, borderWidth: 2 }}>
                        {m.my_role === "löytäjä" ? (
                            <>
                                <T variant="heading">{t("matches.finderTitle", { mine: m.my_bike_label, other: bikeTitle({ brand: m.other_brand, model: m.other_model }) })}</T>
                                <T variant="muted">{t("matches.finderText")}</T>
                            </>
                        ) : (
                            <>
                                <View style={{ flexDirection: "row", gap: 12 }}>
                                    <View style={styles.matchThumb}>
                                        {m.other_image_url ? <Image source={{ uri: m.other_image_url }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="bicycle" size={28} color="#c9b8a6" />}
                                    </View>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <T variant="small">{t("matches.yourBike", { bike: m.my_bike_label })}</T>
                                        <T variant="heading">{t("matches.found", { bike: bikeTitle({ brand: m.other_brand, model: m.other_model }) })}</T>
                                        <T variant="small">{m.other_location || m.other_city}</T>
                                    </View>
                                </View>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                    {m.reasons.map(r => <View key={r} style={styles.reason}><T style={{ fontSize: 12 }}>✓ {tv("reason", r)}</T></View>)}
                                </View>
                                {m.match_status === "uusi" ? (
                                    <View style={{ flexDirection: "row", gap: 10 }}>
                                        <PillButton small title={t("matches.yes")} icon="checkmark" onPress={() => setMatch(m.match_id, "vahvistettu")} style={{ flex: 1 }} />
                                        <PillButton small title={t("matches.no")} color={colors.surface} onPress={() => setMatch(m.match_id, "hylatty")} style={{ flex: 1 }} />
                                    </View>
                                ) : (
                                    <View style={{ gap: 10 }}>
                                        <PillButton small title={t("matches.contactFinder")} icon="message.fill" color={colors.lavender}
                                            onPress={() => router.push({ pathname: "/bike/[id]", params: { id: m.other_bike_id } })} />
                                        <PillButton small title={t("dash.gotItBack")} icon="party.popper.fill" color={colors.mint} onPress={() => setBikeStatus(m.my_bike_id, "löytynyt")} />
                                    </View>
                                )}
                            </>
                        )}
                    </Card>
                ))}
            </View>

            <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <T variant="title" style={{ fontSize: 26 }}>{t("dash.myBikes", { n: bikes.length })}</T>
                    <Pressable onPress={() => router.push("/report/register")} hitSlop={10}><Icon name="plus.circle.fill" size={28} color={colors.raspberry} /></Pressable>
                </View>
                {bikes.length === 0 && <T variant="muted">{t("dash.noBikes")}</T>}
                {bikes.map(b => (
                    <Card key={b.id} style={{ gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <View style={styles.matchThumb}>
                                {b.image_url ? <Image source={{ uri: b.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="bicycle" size={28} color="#c9b8a6" />}
                            </View>
                            <View style={{ flex: 1, gap: 4 }}>
                                <StatusBadge status={b.status} />
                                <T variant="heading">{bikeTitle(b, t("card.unknownBike"))}</T>
                                <T variant="small">SN: {b.serial_number || "–"}</T>
                            </View>
                        </View>
                        {b.status === "varastettu" && <PillButton small title={t("dash.gotItBack")} icon="party.popper.fill" color={colors.mint} onPress={() => setBikeStatus(b.id, "löytynyt")} />}
                        {b.status === "rekisteröity" && (
                            <PillButton small title={t("dash.stolenButton")} icon="exclamationmark.triangle.fill" color={colors.pink}
                                onPress={() => Alert.alert(t("dash.stolenButton"), t("dash.confirmStolen"), [
                                    { text: t("m.cancel"), style: "cancel" },
                                    { text: t("m.ok"), style: "destructive", onPress: () => setBikeStatus(b.id, "varastettu") }
                                ])} />
                        )}
                    </Card>
                ))}
            </View>

            <View style={{ gap: 10 }}>
                <T variant="title" style={{ fontSize: 26 }}>{t("messages.title", { n: messages.length })}</T>
                {messages.length === 0 && <T variant="muted">{t("messages.none")}</T>}
                {messages.map(m => (
                    <Card key={m.id} style={{ gap: 8, borderLeftWidth: 5, borderLeftColor: m.read_at ? colors.border : colors.red }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <T style={{ fontWeight: "700" }}>{m.sender_name}</T>
                            <T variant="small">{bikeTitle(m.bikes ?? {}, "")}</T>
                        </View>
                        <T>{m.body}</T>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            <Pressable onPress={() => Linking.openURL(`mailto:${m.sender_email}`)} style={styles.contactLink}>
                                <Icon name="envelope.fill" size={14} color={colors.raspberry} /><T style={{ color: colors.raspberry, fontWeight: "600" }}>{m.sender_email}</T>
                            </Pressable>
                            {m.sender_phone && (
                                <Pressable onPress={() => Linking.openURL(`tel:${m.sender_phone!.replace(/\s+/g, "")}`)} style={styles.contactLink}>
                                    <Icon name="phone.fill" size={14} color={colors.raspberry} /><T style={{ color: colors.raspberry, fontWeight: "600" }}>{m.sender_phone}</T>
                                </Pressable>
                            )}
                        </View>
                    </Card>
                ))}
            </View>

            <AccountActions />
        </View>
    );
}

function AccountActions() {
    const { t } = useI18n();
    const deleteAccount = () => Alert.alert(t("m.deleteAccount"), t("m.deleteConfirm"), [
        { text: t("m.cancel"), style: "cancel" },
        {
            text: t("m.deleteAccount"), style: "destructive", onPress: async () => {
                const { error } = await supabase.rpc("delete_my_account");
                if (error) return Alert.alert(t("m.error"), error.message);
                await supabase.auth.signOut();
                Alert.alert(t("m.deleted"));
            }
        }
    ]);
    return (
        <View style={{ gap: 12 }}>
            <PillButton title={t("dash.logout")} icon="rectangle.portrait.and.arrow.right" color={colors.surface} onPress={() => supabase.auth.signOut()} />
            <Pressable onPress={deleteAccount} hitSlop={8}><T style={{ color: colors.red, textAlign: "center", fontWeight: "600" }}>{t("m.deleteAccount")}</T></Pressable>
        </View>
    );
}

function Settings() {
    const { t, lang, setLang } = useI18n();
    const links: { key: Key; path: string }[] = [
        { key: "footer.help", path: "/ohjeet" },
        { key: "footer.partners", path: "/kumppanit" },
        { key: "footer.privacy", path: "/tietosuoja" },
        { key: "footer.terms", path: "/kayttoehdot" }
    ];
    return (
        <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
                <T variant="label">{t("m.language")}</T>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {LANGS.map(l => <Chip key={l} label={{ fi: "Suomi", sv: "Svenska", en: "English" }[l]} active={lang === l} onPress={() => setLang(l)} />)}
                </View>
            </View>
            <View style={{ gap: 8 }}>
                <T variant="label">{t("m.info")}</T>
                <Card style={{ paddingVertical: 4 }}>
                    {links.map((l, i) => (
                        <Pressable key={l.path} onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}${l.path}`)}
                            style={[styles.linkRow, i < links.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                            <T>{t(l.key)}</T>
                            <Icon name="arrow.up.right" size={14} color={colors.muted} />
                        </Pressable>
                    ))}
                </Card>
            </View>
            <T variant="small" style={{ textAlign: "center" }}>BikeBack {Constants.expoConfig?.version} · VoonIQ</T>
        </View>
    );
}

const styles = StyleSheet.create({
    matchThumb: { width: 64, height: 64, borderRadius: radius.md, overflow: "hidden", backgroundColor: "#f3ece0", alignItems: "center", justifyContent: "center" },
    reason: { backgroundColor: colors.shell, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    linkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
    contactLink: { flexDirection: "row", alignItems: "center", gap: 6 }
});
