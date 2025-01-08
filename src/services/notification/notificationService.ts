/**
 * Enhanced notification service with better error handling
 */
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { NotificationQueue } from './notificationQueue';
import { NotificationRetry } from './notificationRetry';
import type { Intervention } from '../../types/intervention';

export class NotificationService {
  private static instance: NotificationService;
  private queue: NotificationQueue;
  private retry: NotificationRetry;
  private readonly recipientEmail = import.meta.env.VITE_NOTIFICATION_EMAIL || 'programaCOS@cemig.com.br';

  private constructor() {
    this.queue = NotificationQueue.getInstance();
    this.retry = new NotificationRetry();
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

    try {
      await this.retry.beforeSend();

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: this.recipientEmail,
          subject: this.getSubject(numeroONS, type),
          content: this.createEmailContent(numeroONS, type, changes, intervention)
        }
      });

      if (error) {
        logger.warn('Notification failed, queueing for retry', { 
          numeroONS,
          error 
        });
        
        await this.queue.enqueue(notificationId, {
          to: this.recipientEmail,
          subject: this.getSubject(numeroONS, type),
          content: this.createEmailContent(numeroONS, type, changes, intervention)
        });
        return;
      }

      logger.info('Notification sent successfully', { numeroONS });

    } catch (error) {
      logger.error('Failed to send notification', { numeroONS, error });
      
      // Queue for retry
      await this.queue.enqueue(notificationId, {
        to: this.recipientEmail,
        subject: this.getSubject(numeroONS, type),
        content: this.createEmailContent(numeroONS, type, changes, intervention)
      });
    }
  }

  private getSubject(numeroONS: string, type: string): string {
    const subjects = {
      novo: 'Nova Intervenção',
      alterado: 'Intervenção Atualizada',
      removido: 'Intervenção Removida'
    };
    return `${subjects[type as keyof typeof subjects]} - ${numeroONS}`;
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
      <p><strong>Tipo:</strong> ${this.getSubject(numeroONS, type)}</p>
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
