import { logger } from '../../utils/logger';
import type { Intervention } from '../../types/intervention';

interface ChangeInfo {
  type: 'novo' | 'alterado' | 'removido';
  changes: string[];
}

export class InterventionTracker {
  private previousInterventions: Map<string, Intervention> = new Map();

  public trackChanges(currentInterventions: Intervention[]): Map<string, ChangeInfo> {
    const changes = new Map<string, ChangeInfo>();
    const currentMap = new Map(currentInterventions.map(i => [i.numeroONS, i]));

    // Check for new and modified interventions
    currentMap.forEach((current, numeroONS) => {
      const previous = this.previousInterventions.get(numeroONS);
      
      if (!previous) {
        changes.set(numeroONS, {
          type: 'novo',
          changes: ['Nova intervenção registrada']
        });
      } else if (this.hasChanges(previous, current)) {
        changes.set(numeroONS, {
          type: 'alterado',
          changes: this.getChangeDetails(previous, current)
        });
      }
    });

    // Check for removed interventions
    this.previousInterventions.forEach((_, numeroONS) => {
      if (!currentMap.has(numeroONS)) {
        changes.set(numeroONS, {
          type: 'removido',
          changes: ['Intervenção removida']
        });
      }
    });

    // Update previous state
    this.previousInterventions = currentMap;
    
    if (changes.size > 0) {
      logger.info('Changes detected', { 
        changeCount: changes.size,
        changes: Array.from(changes.entries())
      });
    }

    return changes;
  }

  private hasChanges(previous: Intervention, current: Intervention): boolean {
    return (
      previous.situacao !== current.situacao ||
      previous.dataHoraInicio !== current.dataHoraInicio ||
      previous.dataHoraFim !== current.dataHoraFim ||
      previous.possuiRecomendacao !== current.possuiRecomendacao
    );
  }

  private getChangeDetails(previous: Intervention, current: Intervention): string[] {
    const changes: string[] = [];

    if (previous.situacao !== current.situacao) {
      changes.push(`Situação alterada: ${previous.situacao} → ${current.situacao}`);
    }

    if (previous.dataHoraInicio !== current.dataHoraInicio) {
      changes.push(`Data/hora início alterada: ${previous.dataHoraInicio} → ${current.dataHoraInicio}`);
    }

    if (previous.dataHoraFim !== current.dataHoraFim) {
      changes.push(`Data/hora fim alterada: ${previous.dataHoraFim} → ${current.dataHoraFim}`);
    }

    if (previous.possuiRecomendacao !== current.possuiRecomendacao) {
      changes.push(`Recomendação ${current.possuiRecomendacao ? 'adicionada' : 'removida'}`);
    }

    return changes;
  }
}
