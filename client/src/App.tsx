import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { trpc } from "./lib/trpc";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Importação das Páginas
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
// Importe suas outras páginas aqui (Cooperados, Tickets, etc)

// Componente para Proteger Rotas
function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  // 1. Mostrar carregamento enquanto verifica a sessão
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
  }

  // 2. Lógica principal: Se não estiver logado, redireciona para Login
  if (!user) return <Redirect to="/auth/login" />;

  // 3. Se estiver logado, mostra o componente (Dashboard)
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Rotas Públicas (acessíveis sem login) */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* Rota Protegida do Dashboard: Chama o PrivateRoute que verifica se está logado */}
      <Route path="/">
        {() => <PrivateRoute component={Home} />}
      </Route>
      
      {/* Adicione outras rotas protegidas aqui */}
      {/* <Route path="/tickets/new">{() => <PrivateRoute component={NewTicket} />}</Route> */}

      <Route>
        <div className="flex min-h-screen items-center justify-center">
          <hymd className="text-2xl font-bold text-gray-800">404 - Página não encontrada</hymd>
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
          async headers() {
            // Futuramente, esta função vai enviar o token Supabase
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