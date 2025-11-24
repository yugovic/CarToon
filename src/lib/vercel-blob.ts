import { put, del } from '@vercel/blob';

export async function uploadImage(
  buffer: ArrayBuffer,
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<{ url: string; downloadUrl: string }> {
  try {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    });
    
    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('画像のアップロードに失敗しました');
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Blob delete error:', error);
    throw new Error('画像の削除に失敗しました');
  }
}

export function generateFilename(userId: string, originalName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName?.split('.').pop() || 'jpg';
  return `generations/${userId}/${timestamp}-${random}.${extension}`;
}
