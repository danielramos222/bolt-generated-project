import { Clock } from 'lucide-react';

interface LastUpdateInfoProps {
  title: string;
  timestamp: Date | null;
  className?: string;
}

export function LastUpdateInfo({ title, timestamp, className = '' }: LastUpdateInfoProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Não disponível';
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600">
        {title}: <span className="font-medium">{formatDate(timestamp)}</span>
      </span>
    </div>
  );
}
