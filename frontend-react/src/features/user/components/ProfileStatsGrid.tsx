type ProfileStatItem = {
  label: string;
  value: number;
};

type ProfileStatsGridProps = {
  stats: ProfileStatItem[];
};

export default function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold leading-none">{stat.value}</span>
          <span className="text-base leading-none">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
