import { Intervention } from '../types/intervention';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export class SQLiteService {
  private static instance: SQLiteService;
  private dbPath: string;

  private constructor() {
    this.dbPath = "C:\\Users\\c055442\\Downloads\\daniel1\\APP_MonitoramentoDeIntervenções\\sgi_op_data.db";
  }

  public static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  public async getInterventions(): Promise<Intervention[]> {
    try {
      const db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      const interventions = await db.all(`
        SELECT 
          numeroONS,
          numeroAgente,
          dataHoraInicio,
          dataHoraFim,
          situacao,
          criticidade,
          descricao,
          responsavel,
          possuiRecomendacao,
          ultimaAtualizacao
        FROM intervencoes
      `);

      await db.close();

      return interventions.map(record => ({
        ...record,
        possuiRecomendacao: Boolean(record.possuiRecomendacao)
      }));
    } catch (error) {
      console.error('Erro ao ler banco de dados:', error);
      throw error;
    }
  }

  public async getLastUpdate(): Promise<string> {
    try {
      const db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      const result = await db.get(`
        SELECT MAX(ultimaAtualizacao) as lastUpdate 
        FROM intervencoes
      `);

      await db.close();

      return result?.lastUpdate || new Date().toISOString();
    } catch (error) {
      console.error('Erro ao obter última atualização:', error);
      throw error;
    }
  }
}
