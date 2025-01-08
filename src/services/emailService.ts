import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Intervention = Database['public']['Tables']['interventions']['Row'];

export class EmailService {
  private static instance: EmailService;
  private readonly recipientEmail = 'dsramos@cemig.com.br';

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendNotification(changes: {
    new: Intervention[];
    updated: Intervention[];
    total: number;
  }) {
    if (changes.new.length === 0 && changes.updated.length === 0) return;

    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: this.recipientEmail,
        subject: 'Atualização de Intervenções ONS',
        content: this.createEmailContent(changes)
      }
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  private createEmailContent(changes: {
    new: Intervention[];
    updated: Intervention[];
    total: number;
  }): string {
    const date = new Date().toLocaleString('pt-BR');
    let content = `<h2>Atualização de Intervenções - ${date}</h2>`;
    content += `<p>Total de intervenções: ${changes.total}</p>`;

    if (changes.new.length > 0) {
      content += '<h3>Novas Intervenções</h3><ul>';
      changes.new.forEach(intervention => {
        content += `
          <li>
            <strong>Número ONS:</strong> ${intervention.numero_ons}<br>
            <strong>Situação:</strong> ${intervention.situacao}<br>
            <strong>Início:</strong> ${new Date(intervention.data_hora_inicio).toLocaleString('pt-BR')}<br>
            <strong>Responsável:</strong> ${intervention.responsavel}
          </li>
        `;
      });
      content += '</ul>';
    }

    if (changes.updated.length > 0) {
      content += '<h3>Intervenções Atualizadas</h3><ul>';
      changes.updated.forEach(intervention => {
        content += `
          <li>
            <strong>Número ONS:</strong> ${intervention.numero_ons}<br>
            <strong>Nova Situação:</strong> ${intervention.situacao}<br>
            <strong>Término:</strong> ${new Date(intervention.data_hora_fim).toLocaleString('pt-BR')}
          </li>
        `;
      });
      content += '</ul>';
    }

    return content;
  }
}
