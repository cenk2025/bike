import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/** Native iOS tab bar (Liquid Glass on iOS 26). The app opens on search. */
export default function TabLayout() {
    const { t } = useI18n();
    return (
        <NativeTabs tintColor={colors.raspberry} iconColor={{ default: colors.muted, selected: colors.raspberry }}>
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>{t("tab.search")}</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} md="search" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="map">
                <NativeTabs.Trigger.Label>{t("tab.map")}</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={{ default: "map", selected: "map.fill" }} md="map" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="report">
                <NativeTabs.Trigger.Label>{t("tab.report")}</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} md="add_circle" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <NativeTabs.Trigger.Label>{t("tab.profile")}</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="account_circle" />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
