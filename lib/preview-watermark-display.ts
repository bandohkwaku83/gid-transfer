type PreviewMedia = {
  previewUrl?: string;
  displayUrl?: string;
  url?: string;
  thumbUrl: string;
};

function hasBakedPreviewWatermark(asset: PreviewMedia): boolean {
  const wm = (asset.displayUrl ?? asset.previewUrl)?.trim();
  const thumb = asset.thumbUrl.trim();
  return Boolean(wm && thumb && wm !== thumb);
}

/** Best available display URL before falling back to thumbnails. */
export function bestGalleryMediaSrc(asset: PreviewMedia): string {
  return (
    asset.previewUrl?.trim() ||
    asset.displayUrl?.trim() ||
    asset.url?.trim() ||
    asset.thumbUrl.trim()
  );
}

/** Client gallery image URL — prefer watermarked preview when ready, else full image. */
export function clientGalleryAssetSrc(
  asset: PreviewMedia,
  watermarkPreviewEnabled: boolean,
): string {
  if (watermarkPreviewEnabled) {
    const wm = (asset.displayUrl ?? asset.previewUrl)?.trim();
    if (wm) return wm;
  }
  const full = asset.url?.trim();
  if (full) return full;
  return asset.thumbUrl.trim();
}

/**
 * CSS overlay fallback only when preview watermarking is on and the API has not
 * supplied a distinct watermarked preview URL yet.
 */
export function shouldShowClientPreviewWatermarkOverlay(
  asset: PreviewMedia,
  watermarkPreviewEnabled: boolean,
  isVideo: boolean,
): boolean {
  if (!watermarkPreviewEnabled || isVideo) return false;
  return !hasBakedPreviewWatermark(asset);
}
