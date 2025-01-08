import { Database, BarChart3, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { MonitoringService } from '../services/monitoringService';
import { StatCard } from './monitoring/StatCard';
import { LastUpdateInfo } from './monitoring/LastUpdateInfo';

interface SummaryStats {
  totalInterventions: number;
  newInterventions: number;
  updatedInterventions: number;
  lastONSCheck: Date | null;
  lastDBUpdate: Date | null;
  lastSupabaseSync: Date | null;
  errors: string[];
}

export function MonitoringSummary() {
  const [stats, setStats] = useState<SummaryStats>({
    totalInterventions: 0,
    newInterventions: 0,
    updatedInterventions: 0,
    lastONSCheck: null,
    lastDBUpdate: null,
    lastSupabaseSync: null,
    errors: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const monitoringService = MonitoringService.getInstance();
        const monitoringStatus = monitoringService.getMonitoringStatus();
        
        const { count } = await supabase
          .from('interventions')
          .select('*', { count: 'exact', head: true });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { data: recentInterventions } = await supabase
          .from('interventions')
          .select('created_at, updated_at')
          .gte('created_at', yesterday.toISOString());

        const newCount = recentInterventions?.filter(i => 
          new Date(i.created_at).getTime() === new Date(i.updated_at).getTime()
        ).length || 0;

        const updatedCount = recentInterventions?.filter(i => 
          new Date(i.created_at).getTime() !== new Date(i.updated_at).getTime()
        ).length || 0;

        setStats(prev => ({
          ...prev,
          totalInterventions: count || 0,
          newInterventions: newCount,
          updatedInterventions: updatedCount,
          ...monitoringStatus
        }));

      } catch (error) {
        logger.error('Erro ao buscar estatísticas', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000); // Atualiza a cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Resumo do Monitoramento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total de Intervenções"
          value={stats.totalInterventions}
          icon={Database}
        />
        <StatCard
          title="Novas Intervenções (24h)"
          value={stats.newInterventions}
          icon={BarChart3}
          className="bg-green-50"
        />
        <StatCard
          title="Atualizações (24h)"
          value={stats.updatedInterventions}
          icon={AlertCircle}
          className="bg-blue-50"
        />
      </div>

      <div className="space-y-2">
        <LastUpdateInfo 
          title="Última consulta ONS"
          timestamp={stats.lastONSCheck}
        />
        <LastUpdateInfo 
          title="Última atualização do banco"
          timestamp={stats.lastDBUpdate}
        />
        <LastUpdateInfo 
          title="Última sincronização Supabase"
          timestamp={stats.lastSupabaseSync}
        />
      </div>
    </div>
  );
}
