import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not found. Image upload will not work.');
}

export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}

export async function deleteAvatar(filePath: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  try {
    // Extract the file path from the URL
    const path = filePath.split('/images/')[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
}

