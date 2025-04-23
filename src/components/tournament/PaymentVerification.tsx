import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { v4 as uuidv4 } from "uuid";

interface PaymentVerificationProps {
  tournament: Tournament;
  formData: any;
  onBack: () => void;
  onComplete: () => void;
  selectedSport: string;
  sportConfig?: any;
}

export function PaymentVerification({
  tournament,
  formData,
  onBack,
  onComplete,
  selectedSport,
  sportConfig,
}: PaymentVerificationProps) {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoadingQr(true);
        if (!tournament?.creator_id) {
          console.error("No creator ID found for tournament");
          return;
        }

        // Get the QR code from storage
        const { data } = await supabase
          .storage
          .from('qr-codes')
          .list(`tournaments/${tournament.creator_id}`, {
            limit: 1,
            sortBy: { column: 'name', order: 'desc' }
          });

        if (data && data.length > 0) {
          const { data: urlData } = supabase
            .storage
            .from('qr-codes')
            .getPublicUrl(`tournaments/${tournament.creator_id}/${data[0].name}`);
          
          setQrCodeUrl(urlData.publicUrl);
        } else {
          console.error("No QR code found for creator:", tournament.creator_id);
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
      } finally {
        setLoadingQr(false);
      }
    };

    fetchQRCode();
  }, [tournament?.creator_id]);

  // Get entry fee based on selected sport or tournament-level fee
  const getEntryFee = () => {
    if (sportConfig && sportConfig.entryFee) {
      return sportConfig.entryFee;
    }
    return tournament.entry_fee || 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user || !imageFile) {
      toast.error("Please upload payment proof to continue");
      return;
    }

    if (!tournament?.id) {
      toast.error("Tournament information is missing");
      return;
    }

    let filePath: string | null = null;

    try {
      setIsSubmitting(true);

      // 1. Upload the payment proof image
      setIsUploading(true);
      const fileExt = imageFile.name.split(".").pop();
      filePath = `${user.id}/${tournament.id}_${Date.now()}.${fileExt}`;

      console.log("Uploading payment proof:", { filePath });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload payment proof. Please try again.");
      }

      console.log("Payment proof uploaded successfully");
      setIsUploading(false);

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("payment-screenshots")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for payment proof");
      }

      const paymentProofUrl = publicUrlData.publicUrl;
      console.log("Payment proof URL generated:", paymentProofUrl);

      // 2. Create the tournament join request
      const joinRequestData = {
        tournament_id: tournament.id,
        user_id: user.id,
        player_name: formData.playerName,
        gender: formData.gender,
        mobile_no: formData.mobileNo,
        roles: formData.roles || [],
        partner_name: formData.needsPartner ? formData.partnerName : null,
        partner_gender: formData.needsPartner ? formData.partnerGender : null,
        partner_mobile_no: formData.needsPartner ? formData.partnerMobileNo : null,
        additional_info: formData.additionalInfo,
        payment_proof_url: paymentProofUrl,
        status: "pending",
        sport: selectedSport
      };

      console.log("Creating tournament join request:", joinRequestData);
      console.log("Selected sport value:", selectedSport);

      const { data: requestData, error: requestError } = await supabase
        .from("tournament_join_requests")
        .insert(joinRequestData)
        .select()
        .single();

      if (requestError) {
        console.error("Request error:", requestError);
        console.error("Error details:", {
          message: requestError.message,
          details: requestError.details,
          hint: requestError.hint,
          code: requestError.code
        });
        throw new Error(requestError.message || "Failed to submit join request");
      }

      console.log("Join request created successfully:", requestData);
      toast.success("Your tournament join request has been submitted!");
      onComplete();
    } catch (error: any) {
      console.error("Error submitting join request:", error);
      
      // Delete uploaded file if request creation fails
      if (filePath) {
        try {
          await supabase.storage
            .from("payment-screenshots")
            .remove([filePath]);
        } catch (deleteError) {
          console.error("Error deleting failed upload:", deleteError);
        }
      }

      toast.error(error.message || "Failed to submit join request. Please try again.");
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Required for {selectedSport}</AlertTitle>
        <AlertDescription>
          Please scan the QR code below and make a payment of ₹{getEntryFee()} to complete your registration for {selectedSport}.
          After payment, upload a screenshot of your payment confirmation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Payment QR Code for {selectedSport}</h3>
            <div className="flex justify-center">
              {loadingQr ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`Payment QR Code for ${selectedSport}`}
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded border border-dashed text-muted-foreground">
                  No QR code available. Please contact the organizer.
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="font-medium">Tournament Fee: ₹{getEntryFee()}</p>
              <p className="text-sm text-muted-foreground">
                Scan this QR code using any UPI app to make the payment
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Upload Payment Proof</h3>
            <div className="mb-4">
              <input
                type="file"
                id="payment-proof"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading || isSubmitting}
              />
              <label
                htmlFor="payment-proof"
                className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 text-center transition-colors ${
                  previewUrl ? "border-green-500 bg-green-50" : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="Payment proof preview"
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute bottom-0 right-0 m-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload payment screenshot</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload a screenshot showing your payment confirmation
                    </p>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!imageFile || isUploading || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}
