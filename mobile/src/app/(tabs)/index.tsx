import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import type { PublicBike } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n, type Key } from "@/lib/i18n";
import { colors, fonts, radius, shadow } from "@/lib/theme";
import BikeCard from "@/components/BikeCard";
import SponsorCard, { type AdSlot } from "@/components/SponsorCard";
import { Chip, Icon, IconTile, T } from "@/components/ui";

type Filter = { key: Key; match: (b: PublicBike) => boolean };
const FILTERS: Filter[] = [
    { key: "recent.all", match: () => true },
    { key: "recent.stolen", match: b => b.status === "varastettu" },
    { key: "recent.found", match: b => b.status === "ilmoitettu" },
    { key: "recent.electric", match: b => b.type === "Sähkö" || b.type === "Sähköpotkulauta" },
    { key: "recent.motor", match: b => b.type === "Moottoripyörä" || b.type === "Mopo" }
];

type Row = { kind: "pair"; bikes: PublicBike[] } | { kind: "ad"; ad: AdSlot };
const AD_EVERY = 3; // rows of two bikes between sponsor cards

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

    // Two-column grid, with a clearly-labelled sponsor card every few rows.
    const rows = useMemo<Row[]>(() => {
        const out: Row[] = [];
        let pairs = 0;
        for (let i = 0; i < bikes.length; i += 2) {
            out.push({ kind: "pair", bikes: bikes.slice(i, i + 2) });
            pairs++;
            if (ads.length && pairs % AD_EVERY === 0) out.push({ kind: "ad", ad: ads[(pairs / AD_EVERY - 1) % ads.length] });
        }
        if (ads.length && pairs > 0 && pairs < AD_EVERY) out.push({ kind: "ad", ad: ads[0] });
        return out;
    }, [bikes, ads]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const fmt = (n?: number) => (n === undefined ? "–" : n.toLocaleString(locale));

    const header = (
        <View style={{ gap: 22, paddingBottom: 4 }}>
            <View style={styles.topBar}>
                <View style={styles.logo}><Icon name="bicycle" size={18} color={colors.white} /></View>
                <T style={styles.brand}>BikeBack</T>
            </View>

            <T variant="hero">{t("m.homeTitle")}</T>

            <View style={styles.search}>
                <Icon name="magnifyingglass" size={18} color={colors.muted} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t("m.searchPlaceholder")}
                    placeholderTextColor={colors.muted}
                    style={styles.searchInput}
                    returnKeyType="search"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    accessibilityLabel={t("search.aria")}
                />
            </View>

            {!searching && (
                <>
                    <View style={styles.stats}>
                        <Stat value={fmt(stats?.recovered)} label={t("stats.recovered")} />
                        <View style={styles.statDivider} />
                        <Stat value={fmt(stats?.stolen_active)} label={t("stats.stolenActive")} />
                        <View style={styles.statDivider} />
                        <Stat value={fmt(stats?.matches)} label={t("stats.matches")} />
                    </View>

                    <View style={{ gap: 12 }}>
                        <T variant="section">{t("m.quick")}</T>
                        <View style={styles.grid}>
                            <QuickAction icon="hand.raised.fill" label={t("m.found")} color={colors.accent} onPress={() => router.push("/report/found")} />
                            <QuickAction icon="barcode.viewfinder" label={t("m.check")} color={colors.indigo} onPress={() => router.push("/check")} />
                        </View>
                        <View style={styles.grid}>
                            <QuickAction icon="exclamationmark.triangle.fill" label={t("m.stolen")} color={colors.purple} onPress={() => router.push("/report")} />
                            <QuickAction icon="map.fill" label={t("tab.map")} color={colors.teal} onPress={() => router.push("/map")} />
                        </View>
                    </View>

                    <View style={{ gap: 12 }}>
                        <T variant="section">{t("recent.title")}</T>
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
            data={rows}
            keyExtractor={(row, i) => (row.kind === "pair" ? `p${row.bikes[0].id}` : `a${row.ad.slug}${i}`)}
            renderItem={({ item }) => item.kind === "ad" ? <SponsorCard ad={item.ad} /> : (
                <View style={styles.grid}>
                    <BikeCard bike={item.bikes[0]} />
                    {item.bikes[1] ? <BikeCard bike={item.bikes[1]} /> : <View style={{ flex: 1 }} />}
                </View>
            )}
            ListHeaderComponent={header}
            ListEmptyComponent={
                <View style={{ alignItems: "center", padding: 32, gap: 8 }}>
                    <Icon name="bicycle" size={36} color={colors.faint} />
                    <T variant="muted" style={{ textAlign: "center" }}>
                        {searching ? t("search.none", { q }) : t("recent.empty")}
                    </T>
                </View>
            }
            contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            style={{ backgroundColor: colors.bg }}
        />
    );
}

function QuickAction({ icon, label, color, onPress }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; color: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, pressed && { transform: [{ scale: 0.97 }] }]} accessibilityRole="button">
            <IconTile name={icon} color={color} size={40} />
            <T style={styles.quickLabel} numberOfLines={2}>{label}</T>
        </Pressable>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <View style={{ flex: 1, gap: 2 }}>
            <T style={styles.statValue}>{value}</T>
            <T variant="small" style={{ fontSize: 11, lineHeight: 14 }} numberOfLines={2}>{label.charAt(0) + label.slice(1).toLowerCase()}</T>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
    logo: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    brand: { fontFamily: fonts.bold, fontSize: 18, letterSpacing: -0.2 },
    search: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, height: 52, backgroundColor: colors.field, borderRadius: radius.md },
    searchInput: { flex: 1, fontSize: 16, fontFamily: fonts.regular, color: colors.text },
    grid: { flexDirection: "row", gap: 14 },
    quick: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, minHeight: 66, ...shadow },
    quickLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
    stats: { flexDirection: "row", gap: 14 },
    statValue: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: colors.text },
    statDivider: { width: 1, alignSelf: "stretch", backgroundColor: colors.border, marginVertical: 4 }
});
