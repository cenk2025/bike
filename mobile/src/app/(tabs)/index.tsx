import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import type { PublicBike } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n, type Key } from "@/lib/i18n";
import { colors, fonts, radius } from "@/lib/theme";
import BikeRow from "@/components/BikeRow";
import SponsorCard, { type AdSlot } from "@/components/SponsorCard";
import RadarLogo from "@/components/RadarLogo";
import { Chip, Icon, T } from "@/components/ui";

type Filter = { key: Key; match: (b: PublicBike) => boolean };
const FILTERS: Filter[] = [
    { key: "recent.all", match: () => true },
    { key: "recent.stolen", match: b => b.status === "varastettu" },
    { key: "recent.found", match: b => b.status === "ilmoitettu" },
    { key: "recent.electric", match: b => b.type === "Sähkö" || b.type === "Sähköpotkulauta" },
    { key: "recent.motor", match: b => b.type === "Moottoripyörä" || b.type === "Mopo" }
];

type Item = { kind: "bike"; bike: PublicBike } | { kind: "ad"; ad: AdSlot; tint: string };
const AD_EVERY = 5;
const AD_TINTS = [colors.lavender, colors.mint, colors.pink];

interface Stats { recovered: number; stolen_active: number; found_reports: number; matches: number }

export default function SearchScreen() {
    const { t, locale } = useI18n();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Key>("recent.all");
    const [latest, setLatest] = useState<PublicBike[]>([]);
    const [results, setResults] = useState<{ q: string; bikes: PublicBike[] } | null>(null);
    const [ads, setAds] = useState<AdSlot[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        const [bikes, adRows, statRow] = await Promise.all([
            supabase.from("bikes_public").select("*").in("status", ["varastettu", "ilmoitettu"])
                .order("created_at", { ascending: false }).limit(60),
            supabase.from("ad_slots").select("*"),
            supabase.rpc("public_stats")
        ]);
        if (!bikes.error && bikes.data) setLatest(bikes.data as PublicBike[]);
        if (!adRows.error && adRows.data) setAds(adRows.data as AdSlot[]);
        if (!statRow.error && statRow.data) setStats(statRow.data as Stats);
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    useEffect(() => { load(); }, [load]);

    // Debounced live search (search_bikes RPC: brand/model/colour/city, or a full serial).
    const q = query.trim();
    useEffect(() => {
        if (q.length < 2) return;
        let cancelled = false;
        const handle = setTimeout(async () => {
            const { data, error } = await supabase.rpc("search_bikes", { q, max_results: 40 });
            if (!cancelled) setResults({ q, bikes: !error && data ? (data as PublicBike[]) : [] });
        }, 300);
        return () => { cancelled = true; clearTimeout(handle); };
    }, [q]);

    const searching = q.length >= 2;
    const bikes = useMemo(() => searching
        ? (results?.q === q ? results.bikes : [])
        : latest.filter(FILTERS.find(f => f.key === filter)!.match), [searching, results, q, latest, filter]);

    // Interleave clearly-labelled sponsor cards into the feed.
    const items = useMemo<Item[]>(() => {
        const out: Item[] = [];
        bikes.forEach((bike, i) => {
            out.push({ kind: "bike", bike });
            const n = i + 1;
            if (ads.length && n % AD_EVERY === 0) {
                const k = n / AD_EVERY - 1;
                out.push({ kind: "ad", ad: ads[k % ads.length], tint: AD_TINTS[k % AD_TINTS.length] });
            }
        });
        if (ads.length && bikes.length > 0 && bikes.length < AD_EVERY) {
            out.push({ kind: "ad", ad: ads[0], tint: AD_TINTS[0] });
        }
        return out;
    }, [bikes, ads]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const fmt = (n?: number) => (n === undefined ? "–" : n.toLocaleString(locale));

    const header = (
        <View style={{ gap: 18, paddingBottom: 8 }}>
            <View style={styles.brandRow}>
                <View style={{ flex: 1 }}>
                    <T variant="hero">BikeBack</T>
                    <T variant="heading" style={{ marginTop: 2 }}>{t("hero.tagline")}</T>
                </View>
                <RadarLogo size={52} />
            </View>

            <View style={styles.search}>
                <Icon name="magnifyingglass" size={18} color={colors.muted} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t("m.searchPlaceholder")}
                    placeholderTextColor="#a8919a"
                    style={styles.searchInput}
                    returnKeyType="search"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    accessibilityLabel={t("search.aria")}
                />
            </View>

            {!searching && (
                <>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <QuickAction icon="hand.raised.fill" label={t("m.found")} color={colors.pink} onPress={() => router.push("/report/found")} />
                        <QuickAction icon="barcode.viewfinder" label={t("m.check")} color={colors.lavender} onPress={() => router.push("/check")} />
                    </View>

                    <View style={styles.stats}>
                        <Stat value={fmt(stats?.recovered)} label={t("stats.recovered")} />
                        <View style={styles.statDivider} />
                        <Stat value={fmt(stats?.stolen_active)} label={t("stats.stolenActive")} />
                        <View style={styles.statDivider} />
                        <Stat value={fmt(stats?.matches)} label={t("stats.matches")} />
                    </View>

                    <View style={{ gap: 10 }}>
                        <T variant="title">{t("recent.title")}</T>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {FILTERS.map(f => <Chip key={f.key} label={t(f.key)} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
                        </ScrollView>
                    </View>
                </>
            )}

            {searching && (
                <T variant="muted">
                    {results?.q === q ? t("search.results", { n: bikes.length }) : t("search.searching")}
                </T>
            )}
        </View>
    );

    return (
        <FlatList
            data={items}
            keyExtractor={(item, i) => (item.kind === "bike" ? `b${item.bike.id}` : `a${item.ad.slug}${i}`)}
            renderItem={({ item }) => item.kind === "bike" ? <BikeRow bike={item.bike} /> : <SponsorCard ad={item.ad} tint={item.tint} />}
            ListHeaderComponent={header}
            ListEmptyComponent={
                <View style={{ alignItems: "center", padding: 32, gap: 8 }}>
                    <Icon name="bicycle" size={36} color="#c9b8a6" />
                    <T variant="muted" style={{ textAlign: "center" }}>
                        {searching ? t("search.none", { q }) : t("recent.empty")}
                    </T>
                </View>
            }
            contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: 40 }}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.raspberry} />}
            style={{ backgroundColor: colors.cream }}
        />
    );
}

function QuickAction({ icon, label, color, onPress }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; color: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, { backgroundColor: color }, pressed && { transform: [{ scale: 0.97 }] }]} accessibilityRole="button">
            <View style={styles.quickIcon}><Icon name={icon} size={20} /></View>
            <T style={styles.quickLabel}>{label}</T>
        </Pressable>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
            <T style={{ fontFamily: fonts.display, fontSize: 26, lineHeight: 34 }}>{value}</T>
            <T variant="small" style={{ textAlign: "center", fontSize: 10, letterSpacing: 0.4 }} numberOfLines={2}>{label}</T>
        </View>
    );
}

const styles = StyleSheet.create({
    brandRow: { flexDirection: "row", alignItems: "center", marginTop: 28 },
    search: {
        flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, height: 54,
        backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.maroon
    },
    searchInput: { flex: 1, fontSize: 16, fontFamily: fonts.body, color: colors.maroon },
    quick: { flex: 1, borderRadius: radius.lg, padding: 14, gap: 10, borderWidth: 2, borderColor: colors.maroon, minHeight: 104, justifyContent: "space-between" },
    quickIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
    quickLabel: { fontFamily: fonts.displayMedium, fontSize: 18, lineHeight: 21 },
    stats: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: 8, borderWidth: 1.5, borderColor: colors.border },
    statDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border }
});
