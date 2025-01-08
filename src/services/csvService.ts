import { Intervention } from '../types/intervention';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export class CSVService {
  private static instance: CSVService;
  private filePath: string;

  private constructor() {
    this.filePath = "C:\\Users\\c055442\\Downloads\\daniel1\\APP_MonitoramentoDeIntervenções\\intervencoes.csv";
  }

  public static getInstance(): CSVService {
    if (!CSVService.instance) {
      CSVService.instance = new CSVService();
    }
    return CSVService.instance;
  }

  public async readInterventions(): Promise<Intervention[]> {
    try {
      const fileContent = fs.readFileSync(this.filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      return records.map((record: any) => ({
        numeroONS: record.numeroONS,
        numeroAgente: record.numeroAgente,
        dataHoraInicio: record.dataHoraInicio,
        dataHoraFim: record.dataHoraFim,
        situacao: record.situacao,
        criticidade: record.criticidade,
        descricao: record.descricao,
        responsavel: record.responsavel,
        possuiRecomendacao: record.possuiRecomendacao === 'true'
      }));
    } catch (error) {
      console.error('Erro ao ler arquivo CSV:', error);
      throw error;
    }
  }
}
