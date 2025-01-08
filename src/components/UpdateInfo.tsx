import { Clock, RefreshCw } from 'lucide-react';

interface UpdateInfoProps {
  lastUpdate: string;
  lastSyncTime: Date | null;
}

export function UpdateInfo({ lastUpdate, lastSyncTime }: UpdateInfoProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>Última atualização: {formatDate(lastUpdate)}</span>
      </div>
      {lastSyncTime && (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Última sincronização: {formatDate(lastSyncTime)}</span>
        </div>
      )}
    </div>
  );
}
