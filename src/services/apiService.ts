import { Intervention } from '../types/intervention';

const BASE_URL = "https://integra.ons.org.br/api";
const AUTH_URL = `${BASE_URL}/autenticar`;

export class APIService {
  private static instance: APIService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  public async authenticate(username: string, password: string): Promise<void> {
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username, senha: password }),
      });

      if (!response.ok) {
        throw new Error('Falha na autenticação');
      }

      const data = await response.json();
      this.token = data.access_token;
    } catch (error) {
      console.error('Erro de autenticação:', error);
      throw error;
    }
  }

  public async getInterventions(): Promise<Intervention[]> {
    if (!this.token) {
      throw new Error('Não autenticado');
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 89);
      
      const response = await fetch(
        `${BASE_URL}/sgi/intervencoes?filtro.dataInicio=${today}&filtro.dataFim=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar intervenções');
      }

      const data = await response.json();
      return data.intervencoes;
    } catch (error) {
      console.error('Erro ao buscar intervenções:', error);
      throw error;
    }
  }
}
