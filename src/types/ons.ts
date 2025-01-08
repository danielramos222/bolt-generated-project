/**
 * Tipos para a API do ONS
 */
export interface ONSIntervencao {
  numeroONS: string;
  numeroAgente: string;
  dataHoraSolicitacao: string;
  situacao: string;
  nomeCentroResponsavel: string;
  nomeAgenteSolicitante: string;
  nomeAgenteResponsavel: string;
  malha: string;
  servicos: string;
  observacoes: string;
  equipamentos: any[]; // TODO: Define equipment type
  dataHoraInicio: string;
  dataHoraFim: string;
  periodicidade: string;
  natureza: string;
  classificacao: string;
  justificativaForaPrazo: string;
  tipo: number;
  caracterizacao: string;
  intervencaoAproveitamento: string;
  intervencaoInclusaoServico: string;
  intervencaoSuspensaONS: string;
  elevadoRiscoDesligamento: string;
  dependeCondicoesClimaticas: string;
  execucaoPeriodoNoturno: string;
  postergacaoTrazRisco: boolean;
  acarretaPerdasMultiplas: boolean;
  envolveReleProtecao: boolean;
}
