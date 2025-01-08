import { supabase } from './lib/supabase';

async function testEmailFunction() {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: 'dsramos@cemig.com.br',
      subject: 'Teste de Configuração',
      content: '<h1>Teste de Email</h1><p>Se você recebeu este email, a configuração está funcionando corretamente.</p>'
    }
  });

  if (error) {
    console.error('Erro ao enviar email:', error);
  } else {
    console.log('Email enviado com sucesso:', data);
  }
}

testEmailFunction();
