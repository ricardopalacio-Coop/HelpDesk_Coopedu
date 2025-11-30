import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; // Assume queryClient está em lib/queryClient
import { Toaster } from "@/components/ui/toaster";
import { trpc } from "./lib/trpc"; // Assume trpc está em lib/trpc
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Auth Context

// Importação das Páginas
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ValidationStatus from "@/pages/auth/ValidationStatus"; // Novo Componente de Status UX

// Componente para Proteger Rotas
function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  // 1. Mostrar carregamento enquanto verifica a sessão
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
  }

  // 2. Se não estiver logado, redireciona para Login
  if (!user) return <Redirect to="/auth/login" />;

  // 3. Se estiver logado, mostra o componente (Dashboard)
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Rotas Públicas */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* Rota de Status/Validação (Fluxo UX) */}
      <Route 
          path="/auth/status" 
          component={({ uri }) => {
              // Extrai email e status dos parâmetros da URL
              const params = new URLSearchParams(uri.split('?')[1]);
              const email = params.get('email');
              const status = params.get('status') as 'PENDING' | 'LOGIN_PENDING' | 'SUCCESS';
              
              // Renderiza o componente de status com os dados da URL
              return <ValidationStatus email={email} status={status} />;
          }} 
      />

      {/* Rota Protegida do Dashboard (Rota Raiz) */}
      <Route path="/">
        {() => <PrivateRoute component={Home} />}
      </Route>
      
      {/* 404 Route */}
      <Route>
        <div className="flex min-h-screen items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-800">404 - Página não encontrada</h1>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          // Configuração para enviar o Supabase Token no cabeçalho (Futuro)
          async headers() {
            return {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;