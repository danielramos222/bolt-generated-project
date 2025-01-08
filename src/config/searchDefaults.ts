/**
 * Configurações padrão para busca de intervenções
 */
import { addDays, formatISO } from 'date-fns';

export const CEMIG_AGENTS = [
  'CMG',  // CEMIG
  'CD1',  // CEMIG D
  '792',  // CEMIG GT
  'CG1',  // CEMIG GT
  'GIT',  // CEMIG GT
  'DMO',  // CEMIG D
  'SGG',  // CEMIG GT
  'TMG',  // CEMIG TRANSMISSÃO
  'ESI',  // CEMIG
  'SIE'   // CEMIG
] as const;

export const DEFAULT_SEARCH_CONFIG = {
  // Período padrão: hoje + 45 dias
  getDefaultDates: () => {
    const today = new Date();
    const endDate = addDays(today, 45);
    
    return {
      startDate: formatISO(today, { representation: 'date' }),
      endDate: formatISO(endDate, { representation: 'date' })
    };
  },
  
  // Agentes CEMIG padrão
  defaultAgents: CEMIG_AGENTS
} as const;
