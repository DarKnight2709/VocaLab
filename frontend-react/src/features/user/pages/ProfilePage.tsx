import { useParams, useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { getInitials } from "../../chat/utils";

export default function ProfilePage() {
  const { fullName } = useParams<{ fullName: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Trang cá nhân</h1>
      </div>

      <div className="flex flex-col items-center gap-4 py-12 bg-card border rounded-2xl shadow-sm max-w-2xl mx-auto w-full">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          <AvatarImage src="" /> {/* In a real app, you'd fetch user data by slug/fullName */}
          <AvatarFallback className="text-3xl">
            {getInitials(fullName || "User")}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold">{fullName}</h2>
          <p className="text-muted-foreground mt-1">@ {fullName?.toLowerCase().replace(/\s+/g, '_')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full px-8 mt-8">
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Bạn bè</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Bài viết</div>
          </div>
        </div>

        <div className="w-full px-8 mt-6">
            <Button className="w-full py-6 text-lg rounded-xl">
                Nhắn tin
            </Button>
        </div>
      </div>
    </div>
  );
}
