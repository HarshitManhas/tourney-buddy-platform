import Loading from "./Loading";

interface LoadingPageProps {
  message?: string;
}

const LoadingPage = ({ message = "Loading..." }: LoadingPageProps) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size="lg" showText={true} />
    </div>
  );
};

export default LoadingPage; 