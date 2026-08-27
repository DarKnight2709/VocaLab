type ProfileStatItem = {
  label: string;
  value: number;
};

type ProfileStatsGridProps = {
  stats: ProfileStatItem[];
};

export default function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-colors"
        >
          <span className="text-sm sm:text-base font-extrabold text-foreground tabular-nums">
            {stat.value}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
