/*
  # Create Interventions Table

  1. New Tables
    - `interventions`
      - `id` (uuid, primary key)
      - `numero_ons` (text, unique)
      - `numero_agente` (text)
      - `data_hora_inicio` (timestamptz)
      - `data_hora_fim` (timestamptz)
      - `situacao` (text)
      - `criticidade` (text)
      - `descricao` (text, nullable)
      - `responsavel` (text)
      - `possui_recomendacao` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - On data_hora_inicio (DESC)
    - On numero_ons

  3. Security
    - Enable RLS
    - Add policy for public read access
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS interventions;

-- Create the interventions table
CREATE TABLE interventions (
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

-- Create indexes for better performance
CREATE INDEX interventions_data_hora_inicio_idx ON interventions (data_hora_inicio DESC);
CREATE INDEX interventions_numero_ons_idx ON interventions (numero_ons);

-- Enable Row Level Security
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
  ON interventions FOR SELECT
  TO public
  USING (true);
