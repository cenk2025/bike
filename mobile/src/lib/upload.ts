import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { supabase } from "./supabase";

const MAX_EDGE = 1600;

/**
 * Re-encodes a picked photo as JPEG (max 1600 px). Re-encoding drops all EXIF
 * metadata, including the GPS position where the photo was taken.
 */
async function prepare(uri: string, width: number, height: number) {
    const ctx = ImageManipulator.manipulate(uri);
    if (Math.max(width, height) > MAX_EDGE) {
        ctx.resize(width >= height ? { width: MAX_EDGE } : { height: MAX_EDGE });
    }
    const image = await ctx.renderAsync();
    return image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
}

/** Uploads one photo to the `bike-images` bucket and returns its public URL. */
export async function uploadBikePhoto(asset: { uri: string; width: number; height: number }, folder: string) {
    const { uri } = await prepare(asset.uri, asset.width, asset.height);
    const body = await fetch(uri).then(r => r.arrayBuffer());
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
    const { error } = await supabase.storage.from("bike-images").upload(path, body, { contentType: "image/jpeg" });
    if (error) throw error;
    return supabase.storage.from("bike-images").getPublicUrl(path).data.publicUrl;
}
