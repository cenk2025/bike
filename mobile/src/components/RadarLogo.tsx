import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./ui";

/** Bike badge with radar rings pulsing outward – the brand's "searching" motif. */
export default function RadarLogo({ size = 64 }: { size?: number }) {
    const [pulses] = useState(() => [new Animated.Value(0), new Animated.Value(0)]);

    useEffect(() => {
        let loops: Animated.CompositeAnimation[] = [];
        AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
            if (reduce) return;
            loops = pulses.map((v, i) => Animated.loop(Animated.sequence([
                Animated.delay(i * 1100),
                Animated.timing(v, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })
            ])));
            loops.forEach(l => l.start());
        });
        return () => loops.forEach(l => l.stop());
    }, [pulses]);

    return (
        <View style={{ width: size * 2.2, height: size * 2.2, alignItems: "center", justifyContent: "center" }}>
            {pulses.map((v, i) => (
                <Animated.View
                    key={i}
                    style={[styles.ring, {
                        width: size, height: size, borderRadius: size / 2,
                        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
                        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }]
                    }]}
                />
            ))}
            <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
                <Icon name="bicycle" size={size * 0.5} color={colors.white} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    ring: { position: "absolute", borderWidth: 2, borderColor: colors.accent },
    badge: { backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }
});
