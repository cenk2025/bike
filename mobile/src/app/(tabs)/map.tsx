import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cityCoords, type PublicBike } from "@shared/lib/bikes";
import { supabase } from "@/lib/supabase";
import { useI18n, type Key } from "@/lib/i18n";
import { colors, fonts, radius, shadow } from "@/lib/theme";
import BikeRow from "@/components/BikeRow";
import { Chip, T } from "@/components/ui";

interface CityGroup { key: string; city: string; coords: [number, number]; bikes: PublicBike[]; stolen: number }

const FILTERS: { key: Key; status?: string }[] = [
    { key: "recent.all" },
    { key: "recent.stolen", status: "varastettu" },
    { key: "recent.found", status: "ilmoitettu" }
];

/** Active reports grouped per city (reports store a city, never exact coordinates). */
export default function MapScreen() {
    const { t } = useI18n();
    const insets = useSafeAreaInsets();
    const [bikes, setBikes] = useState<PublicBike[]>([]);
    const [filter, setFilter] = useState<Key>("recent.all");
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        supabase.from("bikes_public").select("*").in("status", ["varastettu", "ilmoitettu"])
            .order("created_at", { ascending: false }).limit(1000)
            .then(({ data, error }) => { if (!error && data) setBikes(data as PublicBike[]); });
    }, []);

    const groups = useMemo(() => {
        const status = FILTERS.find(f => f.key === filter)?.status;
        const byCity = new Map<string, CityGroup>();
        for (const bike of bikes) {
            if (status && bike.status !== status) continue;
            const coords = cityCoords(bike.city);
            if (!coords || !bike.city) continue;
            const key = bike.city.trim().toLowerCase();
            const g = byCity.get(key) ?? { key, city: bike.city.trim(), coords, bikes: [], stolen: 0 };
            g.bikes.push(bike);
            if (bike.status === "varastettu") g.stolen++;
            byCity.set(key, g);
        }
        return [...byCity.values()];
    }, [bikes, filter]);

    const group = groups.find(g => g.key === selected);

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{ latitude: 63.2, longitude: 25.8, latitudeDelta: 10, longitudeDelta: 10 }}
                onPress={() => setSelected(null)}
                showsPointsOfInterests={false}
            >
                {groups.map(g => {
                    const n = g.bikes.length;
                    const size = Math.min(30 + Math.sqrt(n) * 8, 64);
                    const mostlyStolen = g.stolen >= n - g.stolen;
                    return (
                        <Marker
                            key={g.key}
                            coordinate={{ latitude: g.coords[0], longitude: g.coords[1] }}
                            onPress={e => { e.stopPropagation(); setSelected(g.key); }}
                            accessibilityLabel={`${g.city}, ${t("m.cityReports", { n })}`}
                        >
                            <View style={[styles.bubble, {
                                width: size, height: size, borderRadius: size / 2,
                                backgroundColor: mostlyStolen ? colors.accent : colors.green,
                                borderColor: selected === g.key ? colors.text : "#fff"
                            }]}>
                                <T style={styles.bubbleText}>{n}</T>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
                <View style={styles.titleCard}>
                    <T variant="heading">{t("map.title")}</T>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        {FILTERS.map(f => <Chip key={f.key} label={t(f.key)} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
                    </View>
                </View>
            </View>

            {group && (
                <View style={[styles.sheet, { paddingBottom: insets.bottom + 70 }]}>
                    <View style={styles.grabber} />
                    <T variant="title" style={{ fontSize: 24 }}>{group.city}</T>
                    <T variant="muted" style={{ marginBottom: 8 }}>{t("m.cityReports", { n: group.bikes.length })}</T>
                    <FlatList
                        data={group.bikes}
                        keyExtractor={b => String(b.id)}
                        renderItem={({ item }) => <BikeRow bike={item} />}
                        contentContainerStyle={{ gap: 10 }}
                        style={{ maxHeight: 320 }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bubble: { alignItems: "center", justifyContent: "center", borderWidth: 3 },
    bubbleText: { color: "#fff", fontFamily: fonts.bold, fontSize: 15 },
    top: { position: "absolute", left: 0, right: 0, paddingHorizontal: 16 },
    titleCard: { backgroundColor: "rgba(255,255,255,0.96)", borderRadius: radius.lg, padding: 14, ...shadow },
    sheet: {
        position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, gap: 2,
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }
    },
    grabber: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 10 }
});
