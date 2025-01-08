import { RefreshCw } from 'lucide-react';

interface SyncButtonProps {
  onClick: () => void;
  isSyncing: boolean;
}

export function SyncButton({ onClick, isSyncing }: SyncButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSyncing}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
    </button>
  );
}
