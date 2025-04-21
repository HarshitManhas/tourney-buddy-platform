import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading1.json";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Loading = ({ className = "", size = "md", showText = false }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={sizeClasses[size]}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      {showText && (
        <p className="mt-2 text-muted-foreground animate-pulse">Loading...</p>
      )}
    </div>
  );
};

export default Loading; 