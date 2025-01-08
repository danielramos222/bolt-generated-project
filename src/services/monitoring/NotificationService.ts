/**
 * Enhanced notification service with improved error handling
 */
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { NotificationQueue } from './NotificationQueue';
import type { Intervention } from '../../types/intervention';

export class NotificationService {
  private static instance: NotificationService;
  private queue: NotificationQueue;
  private readonly recipientEmail = 'programaCOS@cemig.com.br';
  private sentNotifications = new Set<string>();

  private constructor() {
    this.queue = NotificationQueue.getInstance();
    // Clear sent notifications history periodically
    setInterval(() => this.sentNotifications.clear(), 30 * 60 * 1000);
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async sendChangeNotification(
    numeroONS: string,
    type: 'novo' | 'alterado' | 'removido',
    changes: string[],
    intervention?: Intervention
  ): Promise<void> {
    const notificationId = `${numeroONS}-${type}-${Date.now()}`;
    
    if (this.sentNotifications.has(notificationId)) {
      logger.debug('Duplicate notification prevented', { numeroONS, type });
      return;
    }

    await this.queue.enqueue(notificationId, async () => {
      try {
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: this.recipientEmail,
            subject: `Intervenção ${numeroONS} - ${this.getSubjectByType(type)}`,
            content: this.createEmailContent(numeroONS, type, changes, intervention)
          }
        });

        if (error) throw error;
        
        this.sentNotifications.add(notificationId);
        logger.info('Notification sent successfully', { numeroONS, type });
      } catch (error) {
        logger.error('Failed to send notification', { error, numeroONS });
        throw error;
      }
    });
  }

  private getSubjectByType(type: string): string {
    const subjects = {
      novo: 'Nova Intervenção',
      alterado: 'Intervenção Atualizada',
      removido: 'Intervenção Removida'
    };
    return subjects[type as keyof typeof subjects] || 'Atualização de Intervenção';
  }

  private createEmailContent(
    numeroONS: string,
    type: string,
    changes: string[],
    intervention?: Intervention
  ): string {
    const timestamp = new Date().toLocaleString('pt-BR');
    let content = `
      <h2>Atualização de Intervenção - ${numeroONS}</h2>
      <p><strong>Data/Hora:</strong> ${timestamp}</p>
      <p><strong>Tipo:</strong> ${this.getSubjectByType(type)}</p>
    `;

    if (changes.length > 0) {
      content += `
        <h3>Alterações:</h3>
        <ul>
          ${changes.map(change => `<li>${change}</li>`).join('')}
        </ul>
      `;
    }

    if (intervention) {
      content += `
        <h3>Detalhes da Intervenção:</h3>
        <ul>
          <li><strong>Início:</strong> ${new Date(intervention.dataHoraInicio).toLocaleString('pt-BR')}</li>
          <li><strong>Fim:</strong> ${new Date(intervention.dataHoraFim).toLocaleString('pt-BR')}</li>
          <li><strong>Situação:</strong> ${intervention.situacao}</li>
          <li><strong>Responsável:</strong> ${intervention.responsavel}</li>
          <li><strong>Criticidade:</strong> ${intervention.criticidade}</li>
        </ul>
      `;
    }

    return content;
  }
}
