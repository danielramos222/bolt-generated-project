/**
 * Utilitário para cálculo de períodos de intervenção
 */
import { startOfDay, addDays, formatISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function getInterventionDateRange() {
  const hoje = startOfDay(new Date());
  const dataFinal = addDays(hoje, 89); // 89 dias à frente (total 90 dias incluindo hoje)
  
  return {
    startDate: formatISO(hoje, { representation: 'date' }),
    endDate: formatISO(dataFinal, { representation: 'date' }),
    periodInDays: 90,
    locale: ptBR
  };
}
