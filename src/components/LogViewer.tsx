import { useState } from 'react';
import { ScrollText, AlertTriangle, XCircle } from 'lucide-react';
import { logger } from '../utils/logger';

export function LogViewer() {
  const [showLogs, setShowLogs] = useState(false);
  const logs = logger.getRecentLogs();
  const errorLogs = logs.filter(log => log.level === 'error');
  const hasAuthErrors = errorLogs.some(log => 
    log.message.toLowerCase().includes('auth') || 
    log.message.toLowerCase().includes('token')
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Logs do Sistema</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => logger.clearLogs()}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            <XCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showLogs ? 'Ocultar' : 'Mostrar'} Logs
          </button>
        </div>
      </div>

      {showLogs && (
        <div className="space-y-4">
          {hasAuthErrors && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-yellow-800">
                  Problemas de conexão com o servidor ONS. 
                  Usando dados locais temporariamente.
                </p>
              </div>
            </div>
          )}

          {errorLogs.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-red-800">Erros Recentes</h3>
              </div>
              <div className="mt-2 space-y-1">
                {errorLogs.map((log, index) => (
                  <div key={index} className="text-sm text-red-700">
                    [{new Date(log.timestamp).toLocaleString()}] {log.message}
                    {log.data && <pre className="text-xs mt-1">{JSON.stringify(log.data, null, 2)}</pre>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div 
                  key={index}
                  className={`text-sm ${
                    log.level === 'error' ? 'text-red-600' :
                    log.level === 'warn' ? 'text-yellow-600' :
                    log.level === 'info' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}
                >
                  [{new Date(log.timestamp).toLocaleString()}] [{log.level.toUpperCase()}] {log.message}
                  {log.data && <pre className="text-xs mt-1">{JSON.stringify(log.data, null, 2)}</pre>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
