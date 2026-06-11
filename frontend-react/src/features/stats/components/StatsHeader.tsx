import { Button } from "@/shared/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const StatsHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/vocabulary")} 
        className="h-8 w-8 -ml-2 rounded-full text-muted-foreground"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
    </div>
  );
};
