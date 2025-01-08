/*
  # Criação da tabela de intervenções

  1. Nova Tabela
    - `interventions`
      - `id` (uuid, chave primária)
      - `numero_ons` (texto, único)
      - `numero_agente` (texto)
      - `data_hora_inicio` (timestamp com timezone)
      - `data_hora_fim` (timestamp com timezone)
      - `situacao` (texto)
      - `criticidade` (texto)
      - `descricao` (texto)
      - `responsavel` (texto)
      - `possui_recomendacao` (boolean)
      - `created_at` (timestamp com timezone)
      - `updated_at` (timestamp com timezone)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar política para leitura pública
*/

CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ons text UNIQUE NOT NULL,
  numero_agente text NOT NULL,
  data_hora_inicio timestamptz NOT NULL,
  data_hora_fim timestamptz NOT NULL,
  situacao text NOT NULL,
  criticidade text NOT NULL,
  descricao text,
  responsavel text NOT NULL,
  possui_recomendacao boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública das intervenções"
  ON interventions
  FOR SELECT
  TO public
  USING (true);
