/*
  # Add performance indexes to interventions table

  1. Changes
    - Add index on data_hora_inicio for faster sorting and filtering
    - Add index on numero_ons for faster lookups
    
  2. Purpose
    - Improve query performance for common operations
    - Optimize sorting by start date
    - Speed up lookups by ONS number
*/

-- Create indexes if they don't exist
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
