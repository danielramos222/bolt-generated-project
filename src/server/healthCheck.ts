/**
 * Script para verificar a saúde dos servidores
 */
import http from 'http';

function checkServer(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`Servidor na porta ${port}:`, response);
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      console.error(`Servidor na porta ${port} não está respondendo`);
      resolve(false);
    });

    req.end();
  });
}

async function checkServers() {
  console.log('\nVerificando servidores...\n');
  
  const viteRunning = await checkServer(5173);
  const proxyRunning = await checkServer(3001);

  console.log('\nStatus dos servidores:');
  console.log('Vite (5173):', viteRunning ? '✅ Rodando' : '❌ Parado');
  console.log('Proxy (3001):', proxyRunning ? '✅ Rodando' : '❌ Parado');
  
  if (!viteRunning || !proxyRunning) {
    console.log('\nDica: Execute "npm run dev" para iniciar ambos os servidores');
  }

  process.exit(0);
}

checkServers();
