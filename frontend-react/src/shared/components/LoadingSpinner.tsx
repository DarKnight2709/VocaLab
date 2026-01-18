import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  isLoading: boolean;
  className?: string;
}

const LoadingSpinner = ({ isLoading, className }: LoadingSpinnerProps) => {
  const [isVisible, setIsVisible] = useState(isLoading);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (!isLoading && isVisible) {
      setIsHiding(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsHiding(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isLoading && !isVisible) {
      setIsVisible(true);
    }
  }, [isLoading, isVisible]);

  if (!isVisible) return null;

  return (
    <div className={cn(isHiding ? "opacity-0" : "opacity-100", className)}>
      <div
        className={cn(
          "relative transition-all duration-500 ease-in-out",
          isHiding ? "scale-0 rotate-180" : "scale-100 rotate-0",
        )}
      >
        <img
          src="/logo.png"
          alt="Loading..."
          className="w-20 h-20 object-contain animate-pulse"
        />
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
