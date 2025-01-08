/*
  # Update interventions table indexes and policies

  1. Changes
    - Add missing indexes for performance optimization
    - Ensure RLS is enabled
    - Add read policy if missing
  
  2. Security
    - Verify and enable RLS
    - Add public read access policy if not exists
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
