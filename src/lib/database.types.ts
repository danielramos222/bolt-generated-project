export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      interventions: {
        Row: {
          id: string
          numero_ons: string
          numero_agente: string
          data_hora_inicio: string
          data_hora_fim: string
          situacao: string
          criticidade: string
          descricao: string | null
          responsavel: string
          possui_recomendacao: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_ons: string
          numero_agente: string
          data_hora_inicio: string
          data_hora_fim: string
          situacao: string
          criticidade: string
          descricao?: string | null
          responsavel: string
          possui_recomendacao?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_ons?: string
          numero_agente?: string
          data_hora_inicio?: string
          data_hora_fim?: string
          situacao?: string
          criticidade?: string
          descricao?: string | null
          responsavel?: string
          possui_recomendacao?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
