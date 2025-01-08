import type { ONSIntervencao } from '../../types/ons';
import type { Intervention } from '../../types/intervention';
import { logger } from '../logger';

export function transformONSIntervention(onsData: ONSIntervencao): Intervention {
  try {
    return {
      numeroONS: onsData.numeroONS,
      numeroAgente: onsData.numeroAgente,
      dataHoraInicio: onsData.dataHoraInicio,
      dataHoraFim: onsData.dataHoraFim,
      situacao: onsData.situacao,
      criticidade: determineCriticidade(onsData),
      descricao: formatDescription(onsData),
      responsavel: onsData.nomeAgenteResponsavel,
      possuiRecomendacao: hasRecommendations(onsData)
    };
  } catch (error) {
    logger.error('Error transforming ONS data', { error, data: onsData });
    throw error;
  }
}

function determineCriticidade(onsData: ONSIntervencao): string {
  if (onsData.elevadoRiscoDesligamento === 'S' || 
      onsData.postergacaoTrazRisco || 
      onsData.acarretaPerdasMultiplas) {
    return 'Alta';
  }
  
  if (onsData.envolveReleProtecao || 
      onsData.dependeCondicoesClimaticas === 'S') {
    return 'Média';
  }
  
  return 'Baixa';
}

function formatDescription(onsData: ONSIntervencao): string {
  const parts = [
    onsData.servicos,
    onsData.observacoes,
    onsData.justificativaForaPrazo
  ].filter(Boolean);

  return parts.join(' | ');
}

function hasRecommendations(onsData: ONSIntervencao): boolean {
  return Boolean(
    onsData.elevadoRiscoDesligamento === 'S' ||
    onsData.dependeCondicoesClimaticas === 'S' ||
    onsData.execucaoPeriodoNoturno === 'S'
  );
}
