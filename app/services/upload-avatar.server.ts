import { writeAsyncIterableToWritable } from '@remix-run/node';
import cloudinary from 'cloudinary';

import type { UploadApiResponse } from 'cloudinary';

export default async function uploadImageToCloudinary(
  data: AsyncIterable<Uint8Array>,
  public_id: string
) {
  const uploadPromise = new Promise<UploadApiResponse>(
    async (resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          public_id,
          folder: 'avatars',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          //@ts-ignore
          resolve(result);
        }
      );
      await writeAsyncIterableToWritable(data, uploadStream);
    }
  );

  return uploadPromise;
}
