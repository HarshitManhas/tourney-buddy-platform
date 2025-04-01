
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Pencil, ImagePlus } from "lucide-react";

interface TournamentMediaProps {
  logoPreview: string | null;
  bannerPreview: string | null;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TournamentMedia = ({
  logoPreview,
  bannerPreview,
  handleLogoChange,
  handleBannerChange,
}: TournamentMediaProps) => {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-r from-green-500 to-green-400">
        {bannerPreview ? (
          <img 
            src={bannerPreview} 
            alt="Tournament banner" 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Trophy className="h-16 w-16 text-white/30" />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-4 top-4 bg-white/90 hover:bg-white"
          onClick={() => document.getElementById('banner-upload')?.click()}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Change
        </Button>
        <Input
          id="banner-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
        
        <div className="absolute bottom-0 left-6 transform -translate-y-1/2">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background bg-white shadow-md">
              {logoPreview ? (
                <AvatarImage src={logoPreview} alt="Tournament logo" />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <Trophy className="h-10 w-10" />
                </AvatarFallback>
              )}
            </Avatar>
            <Button
              type="button"
              variant="secondary"
              size="circle"
              className="absolute -bottom-1 -right-1 rounded-full p-1.5"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>
      </div>
      
      <div className="pt-6 pb-4 text-center">
        <h2 className="text-2xl font-bold">TOURNAMENT CREATION FORM</h2>
        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Add Tournament Logo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TournamentMedia;
