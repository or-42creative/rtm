/**
 * Client-side image downscale + JPEG compression to a data URL, so uploaded
 * images can live directly inside the Firestore RTM doc — no Cloud Storage
 * (and no Blaze/billing) required.
 *
 * Firestore caps a document at ~1MB, so we keep the encoded image under ~900KB,
 * stepping quality down if needed.
 */
const MAX_BYTES = 900 * 1024;

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function fileToCompressedDataUrl(
  file: File,
  maxDim = 1100,
  quality = 0.72,
): Promise<string> {
  const img = await loadImage(await readAsDataUrl(file));

  let { width, height } = img;
  if (Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");
  // White backdrop so transparent PNGs don't turn black when flattened to JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let q = quality;
  let out = canvas.toDataURL("image/jpeg", q);
  while (out.length > MAX_BYTES && q > 0.4) {
    q -= 0.1;
    out = canvas.toDataURL("image/jpeg", q);
  }
  return out;
}
