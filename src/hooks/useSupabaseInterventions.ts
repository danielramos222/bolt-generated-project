import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Intervention = Database['public']['Tables']['interventions']['Row'];

export function useSupabaseInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterventions = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('interventions')
        .select('*')
        .order('data_hora_inicio', { ascending: false });

      if (supabaseError) throw supabaseError;

      setInterventions(data);
      setLastUpdate(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();

    // Inscreve-se para atualizações em tempo real
    const subscription = supabase
      .channel('interventions_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'interventions' 
        }, 
        () => {
          fetchInterventions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    interventions,
    lastUpdate,
    loading,
    error,
    refresh: fetchInterventions
  };
}
