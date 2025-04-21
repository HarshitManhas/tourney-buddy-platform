// Script to create storage buckets in Supabase
import { supabase } from "../integrations/supabase/client";

/**
 * Creates buckets for storing tournament media
 */
async function createStorageBuckets() {
  console.log("Starting bucket creation...");

  try {
    // Create qr-codes bucket
    const { data: qrBucket, error: qrError } = await supabase.storage.createBucket(
      'qr-codes',
      { 
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      }
    );

    if (qrError) {
      if (qrError.message.includes('already exists')) {
        console.log("qr-codes bucket already exists");
      } else {
        console.error("Error creating qr-codes bucket:", qrError);
      }
    } else {
      console.log("Created qr-codes bucket successfully");
    }

    // Create tournament-banners bucket
    const { data: bannerBucket, error: bannerError } = await supabase.storage.createBucket(
      'tournament-banners',
      { 
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      }
    );

    if (bannerError) {
      if (bannerError.message.includes('already exists')) {
        console.log("tournament-banners bucket already exists");
      } else {
        console.error("Error creating tournament-banners bucket:", bannerError);
      }
    } else {
      console.log("Created tournament-banners bucket successfully");
    }

    // Create tournament-logos bucket
    const { data: logoBucket, error: logoError } = await supabase.storage.createBucket(
      'tournament-logos',
      { 
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      }
    );

    if (logoError) {
      if (logoError.message.includes('already exists')) {
        console.log("tournament-logos bucket already exists");
      } else {
        console.error("Error creating tournament-logos bucket:", logoError);
      }
    } else {
      console.log("Created tournament-logos bucket successfully");
    }

    // Create payment-screenshots bucket
    const { data: paymentBucket, error: paymentError } = await supabase.storage.createBucket(
      'payment-screenshots',
      { 
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      }
    );

    if (paymentError) {
      if (paymentError.message.includes('already exists')) {
        console.log("payment-screenshots bucket already exists");
      } else {
        console.error("Error creating payment-screenshots bucket:", paymentError);
      }
    } else {
      console.log("Created payment-screenshots bucket successfully");
    }

    // Check buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
    } else {
      console.log("Available buckets:", buckets.map(b => b.name).join(", "));
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error creating buckets:", err);
    return { success: false, error: err.message };
  }
}

// Run the function if directly executed
if (typeof window !== 'undefined') {
  const runButton = document.createElement('button');
  runButton.textContent = 'Create Storage Buckets';
  runButton.style.padding = '10px';
  runButton.style.margin = '20px';
  runButton.style.backgroundColor = '#3b82f6';
  runButton.style.color = 'white';
  runButton.style.borderRadius = '4px';
  runButton.style.cursor = 'pointer';
  
  runButton.onclick = async () => {
    runButton.disabled = true;
    runButton.textContent = 'Creating buckets...';
    
    try {
      const result = await createStorageBuckets();
      if (result.success) {
        runButton.textContent = 'Buckets created successfully!';
        runButton.style.backgroundColor = '#10b981';
      } else {
        runButton.textContent = 'Failed: ' + (result.error || 'Unknown error');
        runButton.style.backgroundColor = '#ef4444';
      }
    } catch (err) {
      runButton.textContent = 'Error: ' + err.message;
      runButton.style.backgroundColor = '#ef4444';
    }
  };
  
  document.body.appendChild(runButton);
}

export { createStorageBuckets }; 