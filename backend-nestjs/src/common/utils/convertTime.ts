export function minutesToTime(minutes: number | null): string {
  if (minutes === null) return "08:00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
