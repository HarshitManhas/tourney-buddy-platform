
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, IndianRupee, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SportConfig } from "@/types/tournament";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentDetailsFormProps {
  sports: SportConfig[];
  updateSport: (id: string, updatedConfig: Partial<SportConfig>) => void;
  setStep: (step: number) => void;
  onSubmit: () => void;
}

const PaymentDetailsForm = ({ 
  sports, 
  updateSport, 
  setStep, 
  onSubmit 
}: PaymentDetailsFormProps) => {
  const { user } = useAuth();
  const [feesEnabled, setFeesEnabled] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [qrPreviewUrls, setQrPreviewUrls] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const toggleFees = (sportId: string, enabled: boolean) => {
    setFeesEnabled(prev => ({
      ...prev,
      [sportId]: enabled
    }));

    if (!enabled) {
      // Reset fee data when disabled
      updateSport(sportId, { 
        additionalDetails: '',
        qrCodeUrl: undefined
      });
      // Reset preview
      setQrPreviewUrls(prev => {
        const updated = {...prev};
        delete updated[sportId];
        return updated;
      });
    }
  };

  // Check if the bucket exists and create it if it doesn't
  const ensureStorageBucket = async () => {
    try {
      // First check if user is logged in
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload QR codes",
          variant: "destructive",
        });
        return false;
      }

      // Check if the bucket exists first
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      
      if (bucketListError) {
        console.error("Error listing buckets:", bucketListError);
        throw new Error("Failed to check if storage bucket exists");
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'payment-proofs');
      
      // Create the bucket if it doesn't exist
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket('payment-proofs', {
          public: true
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          throw new Error("Failed to create storage bucket");
        }
        
        console.log("Storage bucket created successfully");
        
        // Create policies for the new bucket
        try {
          await supabase.rpc('create_storage_policy', {
            bucket_name: 'payment-proofs'
          });
          console.log("Storage policies created successfully");
        } catch (policyError) {
          console.error("Policy creation error:", policyError);
          // Continue even if policy creation fails
        }
      } else {
        console.log("Storage bucket already exists");
      }
      
      return true;
    } catch (error) {
      console.error("Unexpected error in ensureStorageBucket:", error);
      throw new Error("Failed to initialize storage. Please try again later.");
    }
  };

  const handleQrCodeUpload = async (file: File, sportId: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload QR codes",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadError(null);
      setUploading(prev => ({...prev, [sportId]: true}));
      
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setQrPreviewUrls(prev => ({...prev, [sportId]: previewUrl}));

      // Ensure storage bucket exists with proper permissions
      await ensureStorageBucket();

      // Prepare a clean file path with simple structure
      const fileExt = file.name.split('.').pop() || 'png';
      const timestamp = new Date().getTime();
      const fileName = `${sportId}_${timestamp}.${fileExt}`;
      const filePath = `qrcodes/${user.id}/${fileName}`;
      
      console.log("Attempting to upload file to:", filePath);
      
      // Upload with simple metadata to avoid issues
      const { error: uploadError, data } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        if (uploadError.message.includes("row level security")) {
          throw new Error("Permission denied. Storage permissions not properly set up.");
        }
        throw new Error(uploadError.message || "Failed to upload QR code");
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        console.log("File uploaded successfully, public URL:", publicUrlData.publicUrl);
        
        // Update the sport config with the QR code URL
        updateSport(sportId, { 
          qrCodeUrl: publicUrlData.publicUrl 
        });
        
        toast({
          title: "QR Code uploaded",
          description: "QR code uploaded successfully"
        });
      } else {
        throw new Error("Could not get public URL for uploaded file");
      }
    } catch (error: any) {
      console.error("QR code upload error:", error);
      setUploadError(error.message || "Failed to upload QR code");
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload QR code",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({...prev, [sportId]: false}));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Payment Details</h2>
      
      <div className="space-y-6">
        {sports.map((sport) => (
          <div
            key={sport.id}
            className="rounded-md border p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-medium">{sport.sport} - {sport.eventName}</h3>

            <div className="mb-6 flex items-center space-x-2">
              <Switch 
                id={`fee-enabled-${sport.id}`} 
                checked={feesEnabled[sport.id] || false}
                onCheckedChange={(checked) => toggleFees(sport.id, checked)}
              />
              <Label htmlFor={`fee-enabled-${sport.id}`}>Require Entry Fees for this Event</Label>
            </div>
            
            {feesEnabled[sport.id] && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Registration Fee (INR) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      type="number" 
                      placeholder="Enter fee amount" 
                      className="mb-2 pl-9"
                      onChange={(e) => {
                        const fee = parseInt(e.target.value);
                        updateSport(sport.id, { 
                          entryFee: fee,
                          additionalDetails: `Fee: ${fee} INR` 
                        });
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fee for team registration in {sport.sport} event
                  </p>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    UPI QR Code <span className="text-destructive">*</span>
                  </label>
                  <div className="flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/50 p-4 transition-colors hover:bg-muted relative">
                    {qrPreviewUrls[sport.id] ? (
                      <div className="relative h-full w-full">
                        <img 
                          src={qrPreviewUrls[sport.id]} 
                          alt="QR Code Preview" 
                          className="h-full w-full object-contain"
                        />
                        {uploading[sport.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <QrCode className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Upload QR Code</span>
                        <span className="text-xs text-muted-foreground">
                          Upload UPI QR code for payments
                        </span>
                      </div>
                    )}
                    <Input
                      id={`qr-upload-${sport.id}`}
                      type="file"
                      accept="image/*"
                      className="absolute h-full w-full cursor-pointer opacity-0"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleQrCodeUpload(e.target.files[0], sport.id);
                        }
                      }}
                      disabled={uploading[sport.id]}
                    />
                  </div>
                  {uploadError && (
                    <p className="mt-2 text-sm text-destructive">
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline">
            Save as Draft
          </Button>
          <Button onClick={onSubmit}>
            Save & Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsForm;
