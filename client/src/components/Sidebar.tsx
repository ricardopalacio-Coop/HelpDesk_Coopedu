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
  QrCode,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  UserCog,
  Briefcase,
  MessageCircle,
  List,
  Upload,
  Plug,
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
@@ -87,55 +88,60 @@ const navigation = [
        inDevelopment: true,
      },
      {
        name: "Perfil do Usuário",
        href: "/settings/perfil-usuario",
        icon: UserCog,
        inDevelopment: true,
      },
      {
        name: "Empresa",
        href: "/settings/empresa",
        icon: Briefcase,
        inDevelopment: true,
      },
      {
        name: "Mensagens Automáticas",
        href: "/settings/mensagens-automaticas",
        icon: MessageCircle,
      },
      {
        name: "Tipos de Atendimentos",
        href: "/settings/tipos-atendimentos",
        icon: List,
        inDevelopment: true,
      },
      {
      { 
        name: "Importações",
        href: "/settings/importacoes",
        icon: Upload,
      },
      {
        name: "Conectar Whatsapp",
        href: "/whatsapp",
        icon: QrCode,
      },
      {
        name: "APIs",
        href: "/settings/apis",
        icon: Plug,
        inDevelopment: true,
      },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedMenu, setExpandedMenu] = React.useState<string | null>(null);
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logout realizado com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
