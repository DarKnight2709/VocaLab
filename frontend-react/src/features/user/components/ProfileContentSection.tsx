import { FileText, Handshake, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";

type ContentTab = "followers" | "following" | "friends" | "posts";

const contentTabs: Array<{
  key: ContentTab;
  label: string;
  icon: typeof Users;
}> = [
  { key: "followers", label: "Followers", icon: Users },
  { key: "following", label: "Following", icon: UserPlus },
  { key: "friends", label: "Friends", icon: Handshake },
  { key: "posts", label: "Posts", icon: FileText },
];

export default function ProfileContentSection() {
  const [activeTab, setActiveTab] = useState<ContentTab>("followers");

  const activeMeta = useMemo(() => {
    if (activeTab === "following") {
      return {
        title: "Chưa theo dõi ai",
        description: "Những tài khoản bạn theo dõi sẽ hiển thị ở đây.",
        icon: UserPlus,
      };
    }

    if (activeTab === "friends") {
      return {
        title: "Chưa có bạn bè",
        description: "Danh sách bạn bè sẽ xuất hiện trong mục này.",
        icon: Handshake,
      };
    }

    if (activeTab === "posts") {
      return {
        title: "Chưa có bài viết nào",
        description: "Khi có bài viết mới, nội dung sẽ hiển thị ở đây.",
        icon: FileText,
      };
    }

    return {
      title: "Chưa có người theo dõi",
      description: "Những người theo dõi bạn sẽ hiển thị ở đây.",
      icon: Users,
    };
  }, [activeTab]);

  return (
    <section className="mt-10 border-t pt-5">
      <div className="flex items-center gap-1 overflow-x-auto border-b pb-1">
        {contentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-base font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex min-h-80 items-center justify-center rounded-xl border bg-muted/20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-muted/80">
            <activeMeta.icon className="h-12 w-12 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold">{activeMeta.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeMeta.description}
          </p>
        </div>
      </div>
    </section>
  );
}
