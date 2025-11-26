import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cooperados() {
  const { data: cooperados, isLoading } = trpc.cooperados.list.useQuery();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      ativo: { label: "Ativo", variant: "default" },
      inativo: { label: "Inativo", variant: "destructive" },
      sem_producao: { label: "Sem Produção", variant: "secondary" },
    };
    const config = variants[status] || variants.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cooperados</h1>
            <p className="text-muted-foreground">Gerencie os cooperados cadastrados</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cooperado
          </Button>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>{cooperados?.length || 0} cooperado(s) cadastrado(s)</CardTitle>
            <CardDescription>Lista completa de cooperados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : cooperados && cooperados.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cooperados.map((cooperado) => (
                    <TableRow key={cooperado.id}>
                      <TableCell className="font-medium">{cooperado.registrationNumber}</TableCell>
                      <TableCell>{cooperado.name}</TableCell>
                      <TableCell>{cooperado.document}</TableCell>
                      <TableCell>{cooperado.email || "-"}</TableCell>
                      <TableCell>{cooperado.position || "-"}</TableCell>
                      <TableCell>{getStatusBadge(cooperado.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Nenhum cooperado cadastrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
