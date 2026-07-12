import WelcomeBanner from "../components/WelcomeBanner";
import StudyProgressCard from "../components/StudyProgressCard";
import QuickActionsCard from "../components/QuickActionsCard";
import HomeCollections from "../components/HomeCollections";
import HomeRecentPosts from "../components/HomeRecentPosts";

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <WelcomeBanner />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <StudyProgressCard />
          <QuickActionsCard />
        </div>

        <HomeCollections />
        <HomeRecentPosts />
      </div>
    </div>
  );
}

