/**
 * Validadores específicos para dados do ONS
 */
import { isValidDateRange } from '../date/dateUtils';

export function validateIntervencaoParams(params: {
  dataInicio?: string;
  dataFim?: string;
}): string | null {
  if (!params.dataInicio || !params.dataFim) {
    return 'Datas de início e fim são obrigatórias';
  }

  if (!isValidDateRange(params.dataInicio, params.dataFim)) {
    return 'Período inválido. O intervalo deve ser de no máximo 180 dias';
  }

  return null;
}
