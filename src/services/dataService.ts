import { Intervention } from '../types/intervention';

export interface DataUpdate {
  lastUpdate: string;
  data: Intervention[];
}

export class DataService {
  private static instance: DataService;
  private lastUpdate: string = '';
  private interventions: Intervention[] = [
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

  private constructor() {
    this.updateTimestamp();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private updateTimestamp(): void {
    this.lastUpdate = new Date().toISOString();
  }

  public getData(): DataUpdate {
    return {
      lastUpdate: this.lastUpdate,
      data: this.interventions
    };
  }

  public updateData(newData: Intervention[]): void {
    this.interventions = newData;
    this.updateTimestamp();
  }
}
