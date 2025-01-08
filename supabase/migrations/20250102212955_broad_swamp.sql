/*
  # Add Missing Components

  This migration safely adds any missing components to the interventions table
  without attempting to recreate existing objects.

  1. Checks
    - Verifies existence of columns
    - Adds any missing indexes
    - Ensures RLS is enabled
    - Verifies policy existence

  2. Changes
    - Only adds components if they don't exist
    - No destructive operations
*/

-- Add any missing columns (none needed currently, but structure for future use)
DO $$ 
BEGIN
  -- Example of how to safely add a column if needed:
  -- IF NOT EXISTS (
  --   SELECT 1 FROM information_schema.columns 
  --   WHERE table_name = 'interventions' AND column_name = 'new_column'
  -- ) THEN
  --   ALTER TABLE interventions ADD COLUMN new_column text;
  -- END IF;
END $$;

-- Ensure RLS is enabled (idempotent operation)
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

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
