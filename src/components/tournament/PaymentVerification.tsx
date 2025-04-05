
import { useState } from "react";
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
}

export function PaymentVerification({
  tournament,
  formData,
  onBack,
  onComplete,
}: PaymentVerificationProps) {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      setIsSubmitting(true);

      // 1. Upload the payment proof image
      setIsUploading(true);
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }
      setIsUploading(false);

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = await supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      const paymentProofUrl = publicUrlData.publicUrl;

      // 2. Create the tournament join request
      const { data: requestData, error: requestError } = await supabase
        .from("tournament_join_requests")
        .insert({
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
        })
        .select()
        .single();

      if (requestError) {
        throw requestError;
      }

      toast.success("Your tournament join request has been submitted!");
      onComplete();
    } catch (error) {
      console.error("Error submitting join request:", error);
      toast.error("Failed to submit join request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Required</AlertTitle>
        <AlertDescription>
          Please scan the QR code below and make a payment of ₹{tournament.entry_fee} to complete your registration.
          After payment, upload a screenshot of your payment confirmation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Payment QR Code</h3>
            <div className="flex justify-center">
              {tournament.image_url ? (
                <img
                  src={tournament.image_url}
                  alt="Payment QR Code"
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded border border-dashed text-muted-foreground">
                  No QR code available
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="font-medium">Tournament Fee: ₹{tournament.entry_fee}</p>
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
