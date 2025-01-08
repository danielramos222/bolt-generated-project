/**
 * Utilitários para manipulação de datas
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

export function formatISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInDays = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  return !isNaN(start.getTime()) && 
         !isNaN(end.getTime()) && 
         start <= end &&
         diffInDays <= 180;
}
