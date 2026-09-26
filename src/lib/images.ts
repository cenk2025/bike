import { supabase } from "./supabase";

const MAX_EDGE = 1600;

/**
 * Re-encodes a photo through a canvas before upload. This
 *   - strips all EXIF metadata (phones store the GPS location of where the
 *     photo was taken – often the owner's or finder's home),
 *   - applies the EXIF rotation so the picture is upright,
 *   - shrinks large photos so uploads are fast on mobile data.
 */
export async function prepareImage(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => (blob ? resolve(blob) : reject(new Error("Image encoding failed"))),
            "image/jpeg",
            0.85
        );
    });
}

/**
 * Uploads up to `max - current.length` images to the `bike-images` bucket
 * under `folder/` and returns the full list of public URLs.
 */
export async function uploadBikeImages(
    files: FileList,
    folder: string,
    current: string[],
    max = 4
): Promise<{ urls: string[]; error: string | null }> {
    const urls = [...current];

    for (const file of Array.from(files)) {
        if (urls.length >= max) break;

        let blob: Blob;
        try {
            blob = await prepareImage(file);
        } catch {
            return { urls, error: "Kuvaa ei voitu lukea. Kokeile JPG- tai PNG-kuvaa." };
        }

        const path = `${folder}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
            .from("bike-images")
            .upload(path, blob, { contentType: "image/jpeg" });

        if (error) {
            return { urls, error: "Kuvan lataus epäonnistui. Tarkista, että tallennus on oikein konfiguroitu." };
        }

        const { data: { publicUrl } } = supabase.storage.from("bike-images").getPublicUrl(path);
        urls.push(publicUrl);
    }

    return { urls, error: null };
}
