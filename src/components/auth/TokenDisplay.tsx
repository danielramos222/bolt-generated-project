import { useEffect, useState } from 'react';
import { Key } from 'lucide-react';
import { AuthService } from '../../services/auth/authService';
import { TokenInfo } from '../../utils/auth/tokenInfo';

export function TokenDisplay() {
  const [tokenInfo, setTokenInfo] = useState<{
    isValid: boolean;
    expiresIn?: string;
    issuedAt?: string;
  }>({ isValid: false });

  useEffect(() => {
    const checkToken = async () => {
      const authService = AuthService.getInstance();
      const token = authService.getToken();

      if (token) {
        try {
          // Decode token payload (safe part)
          const [, payload] = token.split('.');
          const decodedPayload = JSON.parse(atob(payload));
          
          setTokenInfo({
            isValid: true,
            expiresIn: new Date(decodedPayload.exp * 1000).toLocaleString('pt-BR'),
            issuedAt: new Date(decodedPayload.iat * 1000).toLocaleString('pt-BR')
          });

          // Log token info safely
          TokenInfo.logTokenInfo(token);
        } catch (error) {
          setTokenInfo({ isValid: false });
        }
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Status da Autenticação ONS</h2>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${tokenInfo.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            Status: {tokenInfo.isValid ? 'Autenticado' : 'Não Autenticado'}
          </span>
        </div>

        {tokenInfo.isValid && (
          <>
            <p className="text-sm text-gray-600">
              Emitido em: {tokenInfo.issuedAt}
            </p>
            <p className="text-sm text-gray-600">
              Expira em: {tokenInfo.expiresIn}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
