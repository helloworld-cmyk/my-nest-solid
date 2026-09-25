export interface CoverImageInput {
  imagePath: string;
  type: string;
}

export function pickCoverImage(
  images: readonly CoverImageInput[],
): string | null {
  if (images.length === 0) {
    return null;
  }
  const gallery = images.find((image) => image.type === 'GALLERY');
  return (gallery ?? images[0]).imagePath;
}

export function pickCoverImageOrEmpty(
  images: readonly { imagePath: string; type?: string }[],
): string {
  if (images.length === 0) return '';
  const gallery = images.find(
    (img) => (img as { type?: string }).type === 'GALLERY',
  );
  return (gallery ?? images[0]).imagePath;
}
