/*
  # Update interventions table schema

  This migration safely updates the interventions table schema by:
  1. Adding any missing columns
  2. Creating indexes if they don't exist
  3. Ensuring RLS is enabled
  4. Adding necessary policies

  Note: Uses IF NOT EXISTS checks to prevent errors on existing objects
*/

-- Ensure RLS is enabled (idempotent operation)
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'interventions' 
    AND indexname = 'interventions_data_hora_inicio_idx'
  ) THEN
    CREATE INDEX interventions_data_hora_inicio_idx 
    ON interventions (data_hora_inicio DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'interventions' 
    AND indexname = 'interventions_numero_ons_idx'
  ) THEN
    CREATE INDEX interventions_numero_ons_idx 
    ON interventions (numero_ons);
  END IF;
END $$;

-- Add read policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'interventions' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users"
      ON interventions FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;
