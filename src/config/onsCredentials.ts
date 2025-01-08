interface ONSCredentials {
  usuario: string;
  senha: string;
}

export const defaultCredentials: ONSCredentials = {
  usuario: import.meta.env.VITE_ONS_USUARIO,
  senha: import.meta.env.VITE_ONS_SENHA
};
