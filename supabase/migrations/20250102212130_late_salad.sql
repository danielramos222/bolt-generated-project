/*
  # Update interventions table

  1. Changes
    - Ensures table exists with all required columns
    - Ensures RLS is enabled
    - Ensures read policy exists (skips if already present)
*/

-- Create table if it doesn't exist
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

-- Enable RLS
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'interventions' 
    AND policyname = 'Permitir leitura pública das intervenções'
  ) THEN
    CREATE POLICY "Permitir leitura pública das intervenções"
      ON interventions
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;
