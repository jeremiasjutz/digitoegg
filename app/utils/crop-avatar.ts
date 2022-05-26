type CropOptions = {
  width: number;
  height: number;
};

export default function cropAvatar(
  url: string | null | undefined,
  { width, height }: CropOptions
): string {
  if (url) {
    const urlParts = url.split('upload');
    return urlParts[0] + `upload/w_${width},h_${height},c_fill` + urlParts[1];
  }
  return '/assets/images/avatar.svg';
}
