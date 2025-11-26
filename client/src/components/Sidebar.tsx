import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  Users,
  FileText,
  Building2,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "gerente", "atendente"],
  },
  {
    name: "Tickets",
    href: "/tickets",
    icon: Ticket,
    roles: ["admin", "gerente", "atendente"],
  },
  {
    name: "Cooperados",
    href: "/cooperados",
    icon: Users,
    roles: ["admin", "gerente"],
  },
  {
    name: "Contratos",
    href: "/contratos",
    icon: FileText,
    roles: ["admin", "gerente"],
  },
  {
    name: "Departamentos",
    href: "/departamentos",
    icon: Building2,
    roles: ["admin"],
  },
  {
    name: "WhatsApp",
    href: "/whatsapp",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["admin", "gerente"],
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logout realizado com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  // Filtrar navegação baseado no role do usuário
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "atendente")
  );

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <MessageSquare className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Helpdesk Coopedu</span>
      </div>

      {/* Navegação */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Informações do usuário */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.name || "Usuário"}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {user?.role || "atendente"}
            </p>
          </div>
        </div>
        <Separator className="mb-3" />
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
