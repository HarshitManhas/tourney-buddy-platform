import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, QrCode, IndianRupee } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TournamentPaymentFormProps {
  tournament: Tournament;
  paymentProofPreview: string | null;
  handlePaymentProofChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const TournamentPaymentForm = ({
  tournament,
  paymentProofPreview,
  handlePaymentProofChange,
  onBack,
  onSubmit,
  submitting
}: TournamentPaymentFormProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        
        // If the tournament already has a QR code URL, use it directly
        if (tournament.image_url) {
          console.log("Using tournament image_url as QR code:", tournament.image_url);
          setQrCodeUrl(tournament.image_url);
          setLoading(false);
          return;
        }
        
        // Otherwise check if there are QR codes in the storage
        if (!tournament.id || !tournament.creator_id) {
          console.log("Missing tournament ID or creator ID", { 
            tournamentId: tournament.id, 
            creatorId: tournament.creator_id 
          });
          setLoading(false);
          return;
        }

        console.log("Attempting to fetch QR code from storage for creator:", tournament.creator_id);

        // Check if bucket exists by trying to list files
        const { data: bucketCheck, error: bucketError } = await supabase.storage
          .from('payment-proofs')
          .list('');

        if (bucketError) {
          console.error("Error checking bucket:", bucketError);
          setLoading(false);
          return;
        }

        // Try to fetch QR code from storage
        const { data, error } = await supabase
          .storage
          .from('payment-proofs')
          .list(`qrcodes/${tournament.creator_id}`, {
            limit: 10,
            sortBy: { column: 'name', order: 'desc' }
          });

        if (error) {
          console.error("Error listing QR codes:", error);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          console.log("No QR codes found for creator:", tournament.creator_id);
          setLoading(false);
          return;
        }

        console.log("Found QR codes:", data);

        // Get the URL of the most recent QR code
        const qrCodeFile = data[0];
        const { data: urlData } = supabase
          .storage
          .from('payment-proofs')
          .getPublicUrl(`qrcodes/${tournament.creator_id}/${qrCodeFile.name}`);

        console.log("QR code public URL:", urlData.publicUrl);
        setQrCodeUrl(urlData.publicUrl);
      } catch (error) {
        console.error("Error fetching QR code:", error);
        toast({
          title: "Error fetching QR code",
          description: "Could not load the payment QR code. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [tournament.id, tournament.image_url, tournament.creator_id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification</CardTitle>
        <CardDescription>
          Complete payment to finalize your tournament registration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tournament Fee Information */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Registration Fee</h3>
              <p className="text-sm text-muted-foreground">
                {tournament.format} {tournament.sport}
              </p>
            </div>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {tournament.entry_fee || 0}
            </div>
          </div>
        </div>
        
        {/* Payment Instructions & QR Code */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-medium">Payment Instructions</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Scan the QR code to make payment</li>
              <li>Make sure to save a screenshot of your payment confirmation</li>
              <li>Upload the screenshot below as payment proof</li>
              <li>Your registration will be reviewed by the organizer</li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center justify-center rounded-lg border p-4">
            {loading ? (
              <div className="flex h-48 w-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : qrCodeUrl ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="h-48 w-48 overflow-hidden rounded-lg border">
                  <img 
                    src={qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scan to pay ₹{tournament.entry_fee || 0}
                </p>
              </div>
            ) : (
              <div className="flex h-48 w-48 flex-col items-center justify-center space-y-2">
                <QrCode className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-center text-sm text-muted-foreground">
                  QR code not available. Please contact the organizer for payment details.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Proof Upload */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-proof" className="text-lg font-medium">
              Upload Payment Proof
            </Label>
            <p className="text-sm text-muted-foreground">
              Please upload a screenshot of your payment confirmation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-md border border-dashed bg-muted/50">
              {paymentProofPreview ? (
                <img
                  src={paymentProofPreview}
                  alt="Payment proof preview"
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Upload Screenshot</span>
                  <span className="text-xs text-muted-foreground">
                    Click to upload payment proof
                  </span>
                </div>
              )}
              <Input
                id="payment-proof"
                type="file"
                accept="image/*"
                className="absolute h-full w-full cursor-pointer opacity-0"
                onChange={handlePaymentProofChange}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Once you upload the payment proof and submit, your registration will be reviewed by the tournament organizer.
                You will receive a notification once your request is approved.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Player Details
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={submitting || !paymentProofPreview}
        >
          {submitting ? "Submitting..." : "Submit Registration"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TournamentPaymentForm;
