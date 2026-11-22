// Service: Supabase Storage File Uploads
// Project: B-Zooginer Pre-Order Platform
// Rules: Max 2 MB, images only (JPEG, PNG, WebP), returns public CDN URL

import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Validate image file constraints before attempting upload
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'File tidak ditemukan' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Format file tidak didukung. Harap gunakan gambar JPEG, PNG, atau WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Ukuran file melebihi batas maksimal 2 MB.',
    };
  }

  return { isValid: true };
}

/**
 * Upload product photo to 'products-media' bucket
 * File path: {group_id}/{timestamp}_{filename}
 */
export async function uploadProductImage(
  groupId: string,
  file: File
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'webp';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
  const filePath = `${groupId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah foto produk: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('products-media').getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Upload group promotional poster to 'groups-media' bucket
 * File path: {group_id}/poster_{timestamp}.{ext}
 */
export async function uploadGroupPoster(
  groupId: string,
  file: File
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'webp';
  const fileName = `poster_${Date.now()}.${cleanExt}`;
  const filePath = `${groupId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('groups-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah poster stan: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('groups-media').getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Upload group logo to 'groups-media' bucket
 * File path: {group_id}/logo_{timestamp}.{ext}
 */
export async function uploadGroupLogo(
  groupId: string,
  file: File
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'webp';
  const fileName = `logo_${Date.now()}.${cleanExt}`;
  const filePath = `${groupId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('groups-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah logo stan: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('groups-media').getPublicUrl(filePath);
  return data.publicUrl;
}
