import { SearchTime } from '@/modules/search/search.types';

export function minutesToTime(minutes: number | null): string {
  if (minutes === null) return "08:00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getDateThreshold(time?: SearchTime): Date | null {
    let dateThreshold: Date | null = null;
    const now = new Date();

    switch (time) {
      case '24h':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = null; // 'all'
    }
    return dateThreshold;
  }