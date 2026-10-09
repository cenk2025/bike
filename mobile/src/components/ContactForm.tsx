import { useState } from "react";
import { View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { ErrorBox, Field, Icon, PillButton, T } from "./ui";

/** Sends a message to the bike's owner or finder through BikeBack (bike_messages). */
export default function ContactForm({ bikeId, recipient }: { bikeId: string | number; recipient: "omistaja" | "löytäjä" }) {
    const { t } = useI18n();
    const { session } = useAuth();
    const [form, setForm] = useState({
        name: (session?.user.user_metadata?.full_name as string) || "",
        email: session?.user.email || "",
        phone: "",
        body: ""
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = async () => {
        setSending(true);
        setError(null);
        const { error } = await supabase.from("bike_messages").insert({
            bike_id: bikeId,
            sender_name: form.name.trim(),
            sender_email: form.email.trim(),
            sender_phone: form.phone.trim() || null,
            body: form.body.trim()
        });
        setSending(false);
        if (error) setError(error.message.includes("check constraint") ? t("contact.errCheck") : error.message);
        else setSent(true);
    };

    if (sent) {
        return (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Icon name="checkmark.circle.fill" color="#1f7a44" />
                <T style={{ color: "#1f7a44", flex: 1, fontWeight: "600" }}>
                    {t(recipient === "omistaja" ? "contact.sentOwner" : "contact.sentFinder")}
                </T>
            </View>
        );
    }

    const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.body.trim().length >= 5;
    return (
        <View style={{ gap: 12 }}>
            {error && <ErrorBox message={error} />}
            <Field placeholder={t("contact.name")} value={form.name} onChangeText={name => setForm({ ...form, name })} textContentType="name" autoComplete="name" />
            <Field placeholder={t("contact.email")} value={form.email} onChangeText={email => setForm({ ...form, email })}
                keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" autoComplete="email" />
            <Field placeholder={t("contact.phone")} value={form.phone} onChangeText={phone => setForm({ ...form, phone })} keyboardType="phone-pad" textContentType="telephoneNumber" />
            <Field placeholder={t(recipient === "omistaja" ? "contact.bodyOwner" : "contact.bodyFinder")}
                value={form.body} onChangeText={body => setForm({ ...form, body })} multiline maxLength={2000} />
            <View style={{ flexDirection: "row", gap: 8 }}>
                <Icon name="lock.shield" size={16} color={colors.muted} />
                <T variant="small" style={{ flex: 1 }}>{t("contact.privacy")}</T>
            </View>
            <PillButton title={t("contact.send")} icon="paperplane.fill" onPress={send} loading={sending} disabled={!valid} />
        </View>
    );
}
