import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Ticket, Clock, CheckCircle2, AlertCircle, Users, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: tickets, isLoading: loadingTickets } = trpc.tickets.list.useQuery();
  const { data: cooperados, isLoading: loadingCooperados } = trpc.cooperados.list.useQuery();
  const { data: contracts, isLoading: loadingContracts } = trpc.contracts.list.useQuery();

  // Calcular métricas
  const ticketsAbertos = tickets?.filter((t) => t.status === "aberto" || t.status === "em_andamento").length || 0;
  const ticketsAguardando = tickets?.filter((t) => t.status === "aguardando_cooperado" || t.status === "aguardando_departamento").length || 0;
  const ticketsResolvidos = tickets?.filter((t) => t.status === "resolvido" || t.status === "fechado").length || 0;
  const ticketsTotal = tickets?.length || 0;

  const stats = [
    {
      title: "Tickets Abertos",
      value: ticketsAbertos,
      description: "Em atendimento",
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Aguardando",
      value: ticketsAguardando,
      description: "Pendentes de resposta",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Resolvidos",
      value: ticketsResolvidos,
      description: "Finalizados",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total de Tickets",
      value: ticketsTotal,
      description: "Todos os registros",
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  const otherStats = [
    {
      title: "Cooperados",
      value: cooperados?.length || 0,
      description: "Cadastrados no sistema",
      icon: Users,
      loading: loadingCooperados,
    },
    {
      title: "Contratos",
      value: contracts?.length || 0,
      description: "Ativos e inativos",
      icon: FileText,
      loading: loadingContracts,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de atendimento</p>
        </div>

        {/* Métricas de Tickets */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Outras Métricas */}
        <div className="grid gap-4 md:grid-cols-2">
          {otherStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tickets Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets Recentes</CardTitle>
            <CardDescription>Últimos atendimentos registrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTickets ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{ticket.protocol}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                            ticket.status === "aberto"
                              ? "bg-[var(--status-aberto)]"
                              : ticket.status === "em_andamento"
                              ? "bg-[var(--status-em-andamento)]"
                              : ticket.status === "aguardando_cooperado" || ticket.status === "aguardando_departamento"
                              ? "bg-[var(--status-aguardando)]"
                              : ticket.status === "resolvido"
                              ? "bg-[var(--status-resolvido)]"
                              : "bg-[var(--status-fechado)]"
                          }`}
                        >
                          {ticket.status.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                            ticket.priority === "baixa"
                              ? "bg-[var(--priority-baixa)]"
                              : ticket.priority === "media"
                              ? "bg-[var(--priority-media)]"
                              : ticket.priority === "alta"
                              ? "bg-[var(--priority-alta)]"
                              : "bg-[var(--priority-urgente)]"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum ticket encontrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
