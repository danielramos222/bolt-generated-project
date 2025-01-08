import { ONSService } from './onsService';
import { EmailService } from './emailService';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import type { Database } from '../lib/database.types';

type Intervention = Database['public']['Tables']['interventions']['Row'];

const MONITORING_CONFIG = {
  startHour: 8,
  endHour: 18,
  intervalMinutes: 5,
  daysAhead: 89
};

export class MonitoringService {
  private static instance: MonitoringService;
  private onsService: ONSService;
  private emailService: EmailService;
  private scheduledJob: number | null = null;
  private lastONSCheck: Date | null = null;
  private lastDBUpdate: Date | null = null;
  private lastSupabaseSync: Date | null = null;

  private constructor() {
    this.onsService = ONSService.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private isWithinWorkingHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= MONITORING_CONFIG.startHour && hour < MONITORING_CONFIG.endHour;
  }

  public getMonitoringStatus() {
    return {
      lastONSCheck: this.lastONSCheck,
      lastDBUpdate: this.lastDBUpdate,
      lastSupabaseSync: this.lastSupabaseSync,
      isWithinWorkingHours: this.isWithinWorkingHours()
    };
  }

  public scheduleMonitoring() {
    const checkTime = async () => {
      if (this.isWithinWorkingHours()) {
        await this.checkInterventions();
      } else {
        logger.info("Fora do horário de execução");
      }
    };

    // Initial check
    checkTime();
    
    // Schedule periodic checks
    this.scheduledJob = window.setInterval(
      checkTime, 
      MONITORING_CONFIG.intervalMinutes * 60 * 1000
    );

    return {
      stop: () => {
        if (this.scheduledJob) {
          clearInterval(this.scheduledJob);
          this.scheduledJob = null;
        }
      }
    };
  }

  public async checkInterventions() {
    try {
      logger.info("Iniciando verificação de intervenções");
      this.lastONSCheck = new Date();

      const { intervencoes } = await this.onsService.getInterventions();
      
      const changes = await this.processInterventions(intervencoes);
      this.lastDBUpdate = new Date();

      if (changes.new.length > 0 || changes.updated.length > 0) {
        await this.emailService.sendNotification(changes);
      }

      this.lastSupabaseSync = new Date();
      logger.info("Verificação de intervenções concluída");

      return changes;
    } catch (error) {
      logger.error('Erro ao verificar intervenções:', error);
      throw error;
    }
  }

  private async processInterventions(interventions: any[]): Promise<{
    new: Intervention[];
    updated: Intervention[];
    total: number;
  }> {
    const changes = {
      new: [] as Intervention[],
      updated: [] as Intervention[],
      total: interventions.length
    };

    for (const intervention of interventions) {
      const { data: existing } = await supabase
        .from('interventions')
        .select()
        .eq('numero_ons', intervention.numeroONS)
        .single();

      if (!existing) {
        const newIntervention = await this.createIntervention(intervention);
        if (newIntervention) changes.new.push(newIntervention);
      } else if (this.hasChanges(existing, intervention)) {
        const updatedIntervention = await this.updateIntervention(existing.id, intervention);
        if (updatedIntervention) changes.updated.push(updatedIntervention);
      }
    }

    return changes;
  }

  // ... rest of the class implementation remains the same
}
