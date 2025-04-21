import { supabase } from "@/integrations/supabase/client";

export const BUCKET_NAMES = {
  TOURNAMENT_MEDIA: 'tournament-media',
  PAYMENT_PROOFS: 'payment-proofs',
  TOURNAMENT_LOGO: 'tournament-logos',
  TOURNAMENT_BANNER: 'tournament-banners',
  QR_CODES: 'qr-codes'
} as const;

export async function initializeStorage() {
  try {
    // Check if buckets exist
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }

    const bucketNames = existingBuckets?.map(b => b.name) || [];
    
    // Create buckets if they don't exist
    for (const bucketName of Object.values(BUCKET_NAMES)) {
      if (!bucketNames.includes(bucketName)) {
        const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880 // 5MB limit
        });
        
        if (bucketError && !bucketError.message.includes('already exists')) {
          console.error(`Error creating ${bucketName} bucket:`, bucketError);
          return false;
        }
      }
    }

    // Create storage policies
    try {
      for (const bucketName of Object.values(BUCKET_NAMES)) {
        await supabase.rpc('create_storage_policy', { bucket_name: bucketName });
      }
    } catch (policyError) {
      console.error("Error creating storage policies:", policyError);
      // Continue anyway as the buckets might still work
    }

    return true;
  } catch (err) {
    console.error("Unexpected error initializing storage:", err);
    return false;
  }
}

export async function uploadTournamentMedia(file: File, type: 'logo' | 'banner'): Promise<string | null> {
  try {
    // Check file size (5MB limit)
    if (file.size > 5242880) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const filePath = `${type}_${timestamp}.${fileExt}`;
    
    console.log("Attempting to upload file to:", filePath);
    
    // Choose the correct bucket based on type
    const bucket = type === 'logo' ? BUCKET_NAMES.TOURNAMENT_LOGO : BUCKET_NAMES.TOURNAMENT_BANNER;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`${type} upload error:`, uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    if (!data?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }

    console.log("File uploaded successfully, public URL:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error(`${type} upload error:`, error);
    throw error;
  }
}

export async function uploadPaymentProof(file: File): Promise<string | null> {
  try {
    // Check file size (5MB limit)
    if (file.size > 5242880) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const filePath = `proof_${timestamp}.${fileExt}`;
    
    console.log("Attempting to upload file to:", filePath);
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAMES.PAYMENT_PROOFS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Payment proof upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(BUCKET_NAMES.PAYMENT_PROOFS)
      .getPublicUrl(filePath);
      
    if (!data?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }

    console.log("File uploaded successfully, public URL:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Payment proof upload error:", error);
    throw error;
  }
} 