import WelcomeBanner from "../components/WelcomeBanner";
import StudyProgressCard from "../components/StudyProgressCard";
import QuickActionsCard from "../components/QuickActionsCard";
import HomeCollections from "../components/HomeCollections";
import HomeRecentPosts from "../components/HomeRecentPosts";

export default function HomePage() {
  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">
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

