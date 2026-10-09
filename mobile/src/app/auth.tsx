import { useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View, Pressable } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { supabase, WEB_URL } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { colors, radius } from "@/lib/theme";
import RadarLogo from "@/components/RadarLogo";
import { ErrorBox, Field, PillButton, T } from "@/components/ui";

/**
 * Login / sign-up sheet. Opened when a signed-out user starts a stolen or
 * register report; afterwards it continues to `next`.
 */
export default function AuthScreen() {
    const { next } = useLocalSearchParams<{ next?: string }>();
    const { t } = useI18n();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const finish = () => {
        router.back();
        if (next) router.push(next as Href);
    };

    const submit = async () => {
        setBusy(true);
        setError(null);
        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            setBusy(false);
            if (error) setError(error.message);
            else finish();
        } else {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { full_name: name.trim() } }
            });
            setBusy(false);
            if (error) setError(error.message);
            else if (data.session) finish();
            else {
                Alert.alert(t("signup.successTitle"), t("m.checkEmail"));
                setMode("login");
            }
        }
    };

    const forgot = async () => {
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t("reset.text"));
            return;
        }
        await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${WEB_URL}/uusi-salasana` });
        Alert.alert(t("reset.title"), t("reset.sent"));
    };

    const isLogin = mode === "login";
    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.cream }}>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <View style={{ alignItems: "center" }}><RadarLogo size={56} /></View>
                <T variant="title" style={{ textAlign: "center" }}>{t(isLogin ? "login.title" : "signup.title")}</T>
                {next && <T variant="muted" style={{ textAlign: "center" }}>{t("m.authReason")}</T>}

                <View style={styles.segment}>
                    {(["login", "signup"] as const).map(m => (
                        <Pressable key={m} onPress={() => { setMode(m); setError(null); }} style={[styles.segmentItem, mode === m && styles.segmentActive]}>
                            <T style={{ fontWeight: "700", textAlign: "center" }}>{t(m === "login" ? "login.submit" : "signup.submit")}</T>
                        </Pressable>
                    ))}
                </View>

                {error && <ErrorBox message={error} />}
                {!isLogin && (
                    <Field label={t("signup.name")} placeholder={t("signup.namePlaceholder")} value={name} onChangeText={setName}
                        textContentType="name" autoComplete="name" />
                )}
                <Field label={t("auth.email")} placeholder={t("auth.emailPlaceholder")} value={email} onChangeText={setEmail}
                    keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" autoComplete="email" />
                <Field label={t("auth.password")} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry
                    textContentType={isLogin ? "password" : "newPassword"} autoComplete={isLogin ? "current-password" : "new-password"} />

                <PillButton
                    title={t(isLogin ? "login.submit" : "signup.submit")}
                    icon={isLogin ? "arrow.right.circle.fill" : "person.badge.plus"}
                    onPress={submit}
                    loading={busy}
                    disabled={!email || password.length < 6}
                />
                {isLogin
                    ? <Pressable onPress={forgot}><T style={styles.link}>{t("login.forgot")}</T></Pressable>
                    : <T variant="small" style={{ textAlign: "center" }}>{t("signup.terms")}</T>}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    segment: { flexDirection: "row", backgroundColor: colors.shell, borderRadius: radius.pill, padding: 4 },
    segmentItem: { flex: 1, paddingVertical: 10, borderRadius: radius.pill },
    segmentActive: { backgroundColor: colors.yellow, borderWidth: 1.5, borderColor: colors.maroon },
    link: { textAlign: "center", color: colors.raspberry, fontWeight: "700" }
});
