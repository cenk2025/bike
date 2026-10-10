import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { colors, fonts } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

function RootStack() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.bg },
                headerTintColor: colors.text,
                headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
                headerShadowVisible: false,
                headerBackButtonDisplayMode: "minimal",
                contentStyle: { backgroundColor: colors.bg }
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="bike/[id]" options={{ title: "", headerStyle: { backgroundColor: colors.surface } }} />
            <Stack.Screen name="report/[kind]" options={{ title: "" }} />
            <Stack.Screen name="check" options={{ title: "" }} />
            <Stack.Screen name="auth" options={{ presentation: "modal", title: "" }} />
        </Stack>
    );
}

export default function RootLayout() {
    const [loaded, error] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });

    useEffect(() => {
        if (loaded || error) SplashScreen.hideAsync();
    }, [loaded, error]);

    if (!loaded && !error) return null;

    return (
        <I18nProvider>
            <AuthProvider>
                <StatusBar style="dark" />
                <RootStack />
            </AuthProvider>
        </I18nProvider>
    );
}
