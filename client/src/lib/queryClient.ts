import { QueryClient } from '@tanstack/react-query';

// O QueryClient gerencia o cache e a comunicação com o servidor (tRPC)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configurações padrão: os dados só ficam "velhos" (stale) depois de 1 minuto
      staleTime: 1000 * 60, 
      // Não refaz a requisição se você clicar na janela
      refetchOnWindowFocus: false, 
    },
  },
});