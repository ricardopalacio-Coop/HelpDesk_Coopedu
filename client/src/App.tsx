// client/src/App.tsx
import { ComponentType, useEffect } from "react";
import { Route, Switch as RouterSwitch, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useSupabaseAuth } from "@/_core/hooks/useSupabaseAuth";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Tickets from "@/pages/Tickets";
import TicketsPlaceholder from "@/pages/TicketsPlaceholder";
import Cooperados from "@/pages/Cooperados";
import Contratos from "@/pages/Contratos";
import Departamentos from "@/pages/Departamentos";
import RelatoriosPlaceholder from "@/pages/RelatoriosPlaceholder";
import WhatsAppChat from "@/pages/WhatsAppChat";
import WhatsApp from "@/pages/WhatsApp";
import Configuracoes from "@/pages/Configuracoes";
import ComponentShowcase from "@/pages/ComponentShowcase";
import SettingsAPIs from "@/pages/settings/APIs";
import SettingsEmpresa from "@/pages/settings/Empresa";
import SettingsImportacoes from "@/pages/settings/Importacoes";
import SettingsMensagensAutomaticas from "@/pages/settings/MensagensAutomaticas";
import SettingsPerfilUsuario from "@/pages/settings/PerfilUsuario";
import SettingsTiposAtendimentos from "@/pages/settings/TiposAtendimentos";
import SettingsUsuarios from "@/pages/settings/Usuarios";
import NotFound from "@/pages/NotFound";

interface RouteDefinition {
  path: string;
  component: ComponentType<any>;
}

const publicRoutes: RouteDefinition[] = [
  { path: "/auth", component: Login },
  { path: "/login", component: Login },
];

const protectedRoutes: RouteDefinition[] = [
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/tickets", component: Tickets },
  { path: "/tickets/placeholder", component: TicketsPlaceholder },
  { path: "/cooperados", component: Cooperados },
  { path: "/contratos", component: Contratos },
  { path: "/departamentos", component: Departamentos },
  { path: "/relatorios", component: RelatoriosPlaceholder },
  { path: "/whatsapp", component: WhatsApp },
  { path: "/whatsapp-chat", component: WhatsAppChat },
  { path: "/configuracoes", component: Configuracoes },
  { path: "/component-showcase", component: ComponentShowcase },
  { path: "/settings/usuarios", component: SettingsUsuarios },
  { path: "/settings/perfil-usuario", component: SettingsPerfilUsuario },
  { path: "/settings/empresa", component: SettingsEmpresa },
  { path: "/settings/mensagens-automaticas", component: SettingsMensagensAutomaticas },
  { path: "/settings/tipos-atendimentos", component: SettingsTiposAtendimentos },
  { path: "/settings/importacoes", component: SettingsImportacoes },
  { path: "/settings/apis", component: SettingsAPIs },
];

interface ProtectedRouteProps {
  component: ComponentType<any>;
}

const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { user, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [loading, user, setLocation]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Component />;
};

const withProtection = (Component: ComponentType<any>) => () => (
  <ProtectedRoute component={Component} />
);

function App() {
  return (
    <>
      <RouterSwitch>
        {publicRoutes.map(({ path, component }) => (
          <Route key={path} path={path} component={component} />
        ))}
        {protectedRoutes.map(({ path, component }) => (
          <Route key={path} path={path} component={withProtection(component)} />
        ))}
        <Route component={NotFound} />
      </RouterSwitch>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
