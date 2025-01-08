/**
 * Tipos específicos para o domínio do ONS
 */
export interface ONSDominio {
  valor: string;
  texto: string;
}

export interface ONSResponse<T> {
  indErro: boolean;
  mensagemErro?: {
    Codigo: string;
    Mensagem: string;
  };
  data?: T;
}

export interface ONSEquipamento {
  nomeEquipamento: string;
  nomeCurtoEquipamento: string;
  mrid_Equipamento: string;
  idoons_Equipamento: string;
  nomeInstalacao: string;
  nomeFamilia: string;
  nomeMalha: string;
  principal: boolean;
  sofreraManutencao: boolean;
  ensaioGeracao: boolean;
  atividadeManutencaoProtecao: boolean;
  restricaoOperativa: number;
  limiteLongaDuracao: number;
  limiteCurtaDuracao: number;
}

export interface ONSIntervencaoDetalhada {
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
  equipamentos: ONSEquipamento[];
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
