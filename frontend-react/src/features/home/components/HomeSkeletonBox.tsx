export default function HomeSkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/50 ${className}`} />;
}
