/**
 * Utilitário para cálculo de períodos de intervenções
 */
import { addDays, startOfDay, endOfDay, formatISO } from './dateUtils';

export function getIntervencaoDateRange() {
  const today = startOfDay(new Date());
  
  // Período de 180 dias (89 dias antes e depois)
  const startDate = addDays(today, -89);
  const endDate = addDays(today, 89);
  
  return {
    startDate: formatISO(startDate),
    endDate: formatISO(endDate),
    periodInDays: 179 // Total period is 179 days (89 + current day + 89)
  };
}
