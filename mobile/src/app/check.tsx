import { useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { bikeTitle } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { colors, fonts } from "@/lib/theme";
import SponsorCard, { type AdSlot } from "@/components/SponsorCard";
import { Card, ErrorBox, Field, Icon, Button, T } from "@/components/ui";

interface Result {
    status: "varastettu" | "ilmoitettu" | "rekisteröity";
    brand: string | null; model: string | null; type: string | null; color: string | null;
    city: string | null; event_date: string | null;
}

/** "Check before you buy": is this serial reported stolen / found / registered? */
export default function CheckScreen() {
    const { t, tv, locale } = useI18n();
    const [serial, setSerial] = useState("");
    const [checked, setChecked] = useState<string | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ad, setAd] = useState<AdSlot | null>(null);

    useEffect(() => {
        supabase.from("ad_slots").select("*").limit(1).then(({ data }) => setAd((data?.[0] as AdSlot) ?? null));
    }, []);

    const check = async () => {
        const value = serial.trim();
        if (value.length < 4) return setError(t("check.errShort"));
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.rpc("check_serial", { p_serial: value });
        setLoading(false);
        if (error) return setError(t("check.errFail"));
        setResults((data ?? []) as Result[]);
        setChecked(value);
    };

    const stolen = results.find(r => r.status === "varastettu");
    const registered = results.find(r => r.status === "rekisteröity");
    const found = results.find(r => r.status === "ilmoitettu");
    const unknown = t("card.unknownBike");

    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={90}>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
                <T variant="title">{t("check.title")}</T>
                <T variant="muted">{t("check.intro")}</T>

                <Field placeholder={t("check.placeholder")} value={serial} onChangeText={setSerial} autoCapitalize="characters"
                    autoCorrect={false} returnKeyType="search" onSubmitEditing={check} accessibilityLabel={t("check.aria")} />
                <Button title={loading ? t("check.checking") : t("check.button")} icon="magnifyingglass" onPress={check} loading={loading} />
                {error && <ErrorBox message={error} />}

                {checked && !loading && (
                    stolen ? (
                        <ResultCard icon="exclamationmark.octagon.fill" color="#c62828" bg="#fff1f1" title={t("check.stolenTitle")}>
                            <T style={{ fontFamily: fonts.bold }}>
                                {bikeTitle(stolen, unknown)}
                                {[tv("type", stolen.type), tv("color", stolen.color)].filter(Boolean).length > 0 && ` (${[tv("type", stolen.type), tv("color", stolen.color)].filter(Boolean).join(", ")})`}
                                {stolen.city ? `, ${stolen.city}` : ""}
                            </T>
                            {stolen.event_date && <T>{t("check.stolenOn", { date: new Date(stolen.event_date).toLocaleDateString(locale) })}</T>}
                            <T><T style={{ fontFamily: fonts.bold }}>{t("check.dontBuy")}</T> {t("check.dontBuyText")}</T>
                        </ResultCard>
                    ) : registered ? (
                        <ResultCard icon="info.circle.fill" color="#6a1b9a" bg="#f6edfc" title={t("check.registeredTitle")}>
                            <T>{t("check.registeredText", { bike: bikeTitle(registered, unknown) })}</T>
                        </ResultCard>
                    ) : found ? (
                        <ResultCard icon="info.circle.fill" color="#1f7a44" bg="#ecf9f1" title={t("check.foundTitle")}>
                            <T>{t("check.foundText", { bike: bikeTitle(found, unknown) + (found.city ? `, ${found.city}` : "") })}</T>
                        </ResultCard>
                    ) : (
                        <ResultCard icon="checkmark.shield.fill" color="#1f7a44" bg="#ecf9f1" title={t("check.noneTitle")}>
                            <T>{t("check.noneText", { serial: checked })}</T>
                        </ResultCard>
                    )
                )}

                <Card style={{ gap: 10 }}>
                    <T variant="heading">{t("check.tipsTitle")}</T>
                    {(["check.tip1", "check.tip2", "check.tip3", "check.tip4", "check.tip5"] as const).map(k => (
                        <View key={k} style={{ flexDirection: "row", gap: 8 }}>
                            <Icon name="checkmark.circle.fill" size={16} color={colors.accent} />
                            <T style={{ flex: 1 }}>{t(k)}</T>
                        </View>
                    ))}
                </Card>

                {ad && <SponsorCard ad={ad} />}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function ResultCard({ icon, color, bg, title, children }: { icon: Parameters<typeof Icon>[0]["name"]; color: string; bg: string; title: string; children: React.ReactNode }) {
    return (
        <View style={{ backgroundColor: bg, borderRadius: 20, padding: 18, gap: 8, borderLeftWidth: 6, borderLeftColor: color }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Icon name={icon} size={22} color={color} />
                <T variant="heading" style={{ color }}>{title}</T>
            </View>
            {children}
        </View>
    );
}
