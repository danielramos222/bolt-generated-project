import { useState, useEffect } from 'react';
import { Intervention } from '../types/intervention';
import { mockInterventions } from '../services/mockService';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

export function useInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInterventions(mockInterventions);
      setLastUpdate(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { interventions, lastUpdate, loading, error, refresh: fetchData };
}
