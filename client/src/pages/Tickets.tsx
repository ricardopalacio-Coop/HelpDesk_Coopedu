import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tickets() {
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const { data: tickets, isLoading } = trpc.tickets.list.useQuery();

  // Filtrar tickets
  const filteredTickets = tickets?.filter((ticket) => {
    if (statusFilter === "todos") return true;
    return ticket.status === statusFilter;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">Gerencie todos os atendimentos</p>
          </div>
          <Link href="/tickets/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Ticket
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine sua busca de tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar por protocolo ou descrição..." className="pl-9" />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando_cooperado">Aguardando Cooperado</SelectItem>
                  <SelectItem value="aguardando_departamento">Aguardando Departamento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredTickets?.length || 0} ticket(s) encontrado(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredTickets && filteredTickets.length > 0 ? (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-lg">#{ticket.protocol}</span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
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
                            className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                              ticket.priority === "baixa"
                                ? "bg-[var(--priority-baixa)]"
                                : ticket.priority === "media"
                                ? "bg-[var(--priority-media)]"
                                : ticket.priority === "alta"
                                ? "bg-[var(--priority-alta)]"
                                : "bg-[var(--priority-urgente)]"
                            }`}
                          >
                            Prioridade: {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Aberto em: {new Date(ticket.openedAt).toLocaleString("pt-BR")}</span>
                          {ticket.slaDeadline && (
                            <span className="font-medium text-orange-600">
                              SLA: {new Date(ticket.slaDeadline).toLocaleString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Nenhum ticket encontrado com os filtros selecionados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
