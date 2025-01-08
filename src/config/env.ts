export const env = {
  isDev: import.meta.env.DEV,
  port: 3001,
  ons: {
    usuario: import.meta.env.VITE_ONS_USUARIO,
    senha: import.meta.env.VITE_ONS_SENHA
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
} as const;
