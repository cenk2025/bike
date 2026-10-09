import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./ui";

/**
 * Full-screen photo viewer: swipe between photos, pinch to zoom (iOS),
 * the whole photo is always visible (contain).
 */
export default function PhotoViewer({ images, index, onClose }: { images: string[]; index: number | null; onClose: () => void }) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [current, setCurrent] = useState(0);

    return (
        <Modal
            visible={index !== null}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            onShow={() => setCurrent(index ?? 0)}
            statusBarTranslucent
        >
            <View style={styles.backdrop}>
                <FlatList
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={index ?? 0}
                    getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                    onMomentumScrollEnd={e => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
                    keyExtractor={uri => uri}
                    renderItem={({ item }) => (
                        <ScrollView
                            style={{ width, height }}
                            contentContainerStyle={{ width, height, alignItems: "center", justifyContent: "center" }}
                            maximumZoomScale={4}
                            minimumZoomScale={1}
                            centerContent
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        >
                            <Image source={{ uri: item }} style={{ width, height }} contentFit="contain" transition={150} />
                        </ScrollView>
                    )}
                />
                <View style={[styles.topBar, { top: insets.top + 8 }]} pointerEvents="box-none">
                    {images.length > 1 ? <Text style={styles.counter}>{current + 1} / {images.length}</Text> : <View />}
                    <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
                        <Icon name="xmark" size={18} color="#fff" />
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "#000" },
    topBar: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    counter: { color: "#fff", fontSize: 15, fontWeight: "600" },
    close: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }
});
