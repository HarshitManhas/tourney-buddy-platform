
import Navbar from "./Navbar";
import Footer from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default PageLayout;
