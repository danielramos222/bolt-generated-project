import { Intervention } from '../types/intervention';

export const mockInterventions: Intervention[] = [
  {
    numeroONS: "INT001",
    numeroAgente: "AG123",
    dataHoraInicio: "2024-03-15T08:00:00",
    dataHoraFim: "2024-03-15T17:00:00",
    situacao: "Em Andamento",
    criticidade: "Alta",
    descricao: "Manutenção Emergencial",
    responsavel: "Carlos Silva",
    possuiRecomendacao: true
  },
  {
    numeroONS: "INT002",
    numeroAgente: "AG456",
    dataHoraInicio: "2024-03-16T09:30:00",
    dataHoraFim: "2024-03-16T15:00:00",
    situacao: "Indeferido",
    criticidade: "Média",
    descricao: "Inspeção Periódica",
    responsavel: "Ana Santos",
    possuiRecomendacao: false
  },
  {
    numeroONS: "INT003",
    numeroAgente: "AG789",
    dataHoraInicio: "2024-03-17T10:00:00",
    dataHoraFim: "2024-03-17T18:00:00",
    situacao: "Concluído",
    criticidade: "Baixa",
    descricao: "Atualização de Sistema",
    responsavel: "Roberto Lima",
    possuiRecomendacao: true
  }
];
