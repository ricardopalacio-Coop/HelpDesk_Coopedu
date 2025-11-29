import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { trpc } from "./lib/trpc";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Proteção de Rota: Se não estiver logado, chuta pro Login
function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
  if (!user) return <Redirect to="/auth/login" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      {/* Rota Protegida do Dashboard */}
      <Route path="/">
        {() => <PrivateRoute component={Home} />}
      </Route>

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
          async headers() { return {}; },
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