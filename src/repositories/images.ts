import { supabase } from "../lib/supabase";

export type ImageBucket = "avatars" | "logos";

/** ブラウザ側で縮小してから上げる。アバター・ロゴは小さく表示するので 256px で十分 */
export async function resizeImage(file: File, maxSize = 256): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("画像の変換に失敗しました"))), "image/webp", 0.85),
  );
}

/** Storage にアップロードして公開 URL を返す。テーブルにはこの URL だけを保存する */
export async function uploadImage(bucket: ImageBucket, file: File): Promise<string> {
  const blob = await resizeImage(file);
  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: "image/webp" });
  if (error) throw new Error(`画像のアップロード: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
