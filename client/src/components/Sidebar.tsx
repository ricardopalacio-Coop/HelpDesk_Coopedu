import React from "react";
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
  ChevronLeft,
  ChevronRight,
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

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
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
    <div className={cn(
      "flex h-full flex-col border-r bg-gradient-to-b from-[#0c2856] to-[#005487] text-white shadow-xl transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo e Botão Toggle */}
      <div className="relative border-b border-white/10">
        {/* Botão Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-white hover:bg-white/10 h-8 w-8 z-10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        
        {/* Logo e Texto */}
        {!collapsed ? (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <img 
              src="/logo-coopedu.png" 
              alt="Coopedu" 
              className="h-16 w-auto brightness-0 invert mb-3"
            />
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">Helpdesk</span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-6">
            <img 
              src="/logo-coopedu.png" 
              alt="Coopedu" 
              className="h-12 w-auto brightness-0 invert"
            />
          </div>
        )}
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Informações do usuário */}
      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-semibold backdrop-blur-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user?.name || "Usuário"}</p>
                <p className="truncate text-xs text-white/60 capitalize">
                  {user?.role || "atendente"}
                </p>
              </div>
            </div>
            <Separator className="mb-3 bg-white/10" />
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
