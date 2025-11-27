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
import { Plus, Pencil, Trash2, Search, FileSpreadsheet, FileText, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ESTADOS_BRASIL } from "@shared/brasil";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

type Contract = {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  status: string;
  validityDate: string | null;
  isSpecial: boolean;
  createdAt: Date;
};

export default function Contratos() {
  const { data: contracts, isLoading } = trpc.contracts.list.useQuery();
  
  // Estados para modal de criação
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [validityDate, setValidityDate] = useState("");
  
  // Estados para modal de edição
  const [openEdit, setOpenEdit] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editValidityDate, setEditValidityDate] = useState("");
  const [editStatus, setEditStatus] = useState<"ativo" | "inativo">("ativo");
  
  // Estados para exclusão
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  
  // Estados para filtros
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativo" | "inativo">("todos");
  
  const utils = trpc.useUtils();
  
  // Mutation para criar contrato
  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast.success("Contrato criado com sucesso!");
      setOpenCreate(false);
      setName("");
      setCity("");
      setState("");
      setValidityDate("");
      utils.contracts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao criar contrato: ${error.message}`);
    },
  });
  
  // Mutation para atualizar contrato
  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => {
      toast.success("Contrato atualizado com sucesso!");
      setOpenEdit(false);
      setEditingContract(null);
      utils.contracts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar contrato: ${error.message}`);
    },
  });
  
  // Mutation para excluir contrato permanentemente
  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => {
      toast.success("Contrato excluído com sucesso!");
      setOpenDelete(false);
      setDeletingContract(null);
      utils.contracts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir contrato: ${error.message}`);
    },
  });
  
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    createMutation.mutate({
      name: name,
      city: city,
      state: state,
      status: "ativo",
      validityDate: validityDate || undefined,
    });
  };
  
  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setEditName(contract.name);
    setEditCity(contract.city || "");
    setEditState(contract.state || "");
    
    // Tratar validityDate que pode ser string ou null
    let formattedDate = "";
    if (contract.validityDate) {
      const dateStr = String(contract.validityDate);
      formattedDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    }
    setEditValidityDate(formattedDate);
    
    setEditStatus(contract.status as "ativo" | "inativo");
    setOpenEdit(true);
  };
  
  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editingContract) return;
    
    updateMutation.mutate({
      id: editingContract.id,
      name: editName,
      city: editCity,
      state: editState,
      status: editStatus,
      validityDate: editValidityDate && editValidityDate.trim() !== "" ? editValidityDate : undefined,
    });
  };
  
  const handleDelete = (contract: Contract) => {
    setDeletingContract(contract);
    setOpenDelete(true);
  };
  
  const confirmDelete = () => {
    if (!deletingContract) return;
    
    deleteMutation.mutate({
      id: deletingContract.id,
    });
  };
  
  // Filtrar contratos
  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    
    return contracts.filter((contract) => {
      const matchName = filterName === "" || 
        contract.name.toLowerCase().includes(filterName.toLowerCase());
      
      const matchStatus = filterStatus === "todos" || 
        contract.status === filterStatus;
      
      return matchName && matchStatus;
    });
  }, [contracts, filterName, filterStatus]);
  
  // Exportar para XLS
  const exportToXLS = () => {
    if (!filteredContracts || filteredContracts.length === 0) {
      toast.error("Nenhum contrato para exportar");
      return;
    }
    
    const data = filteredContracts.map((contract) => ({
      ID: contract.id,
      Nome: contract.name,
      Cidade: contract.city || "-",
      UF: contract.state || "-",
      Status: contract.status,
      Validade: contract.validityDate
        ? new Date(contract.validityDate).toLocaleDateString("pt-BR")
        : "-",
      Especial: contract.isSpecial ? "Sim" : "Não",
      "Criado em": new Date(contract.createdAt).toLocaleDateString("pt-BR"),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contratos");
    XLSX.writeFile(wb, `contratos_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Arquivo XLS exportado com sucesso!");
  };
  
  // Exportar para CSV
  const exportToCSV = () => {
    if (!filteredContracts || filteredContracts.length === 0) {
      toast.error("Nenhum contrato para exportar");
      return;
    }
    
    const headers = ["ID", "Nome", "Cidade", "UF", "Status", "Validade", "Especial", "Criado em"];
    const rows = filteredContracts.map((contract) => [
      contract.id,
      contract.name,
      contract.city || "-",
      contract.state || "-",
      contract.status,
      contract.validityDate
        ? new Date(contract.validityDate).toLocaleDateString("pt-BR")
        : "-",
      contract.isSpecial ? "Sim" : "Não",
      new Date(contract.createdAt).toLocaleDateString("pt-BR"),
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contratos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("Arquivo CSV exportado com sucesso!");
  };

  const getStatusBadge = (status: string) => {
    return status === "ativo" ? (
      <Badge variant="default" className="bg-[#3ab54a]">Ativo</Badge>
    ) : (
      <Badge variant="destructive">Inativo</Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
            <p className="text-muted-foreground">Gerencie os contratos do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} title="Exportar para CSV">
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportToXLS} title="Exportar para Excel">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              XLS
            </Button>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contrato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Contrato</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do contrato
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Contrato *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite o nome do contrato"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Digite o nome da cidade"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">UF *</Label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASIL.map((estado) => (
                          <SelectItem key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="validityDate">Data de Validade</Label>
                    <Input
                      id="validityDate"
                      type="date"
                      value={validityDate}
                      onChange={(e) => setValidityDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Criando..." : "Criar Contrato"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Filtros Modernos */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filtros de Busca</CardTitle>
                <CardDescription>Refine sua pesquisa de contratos</CardDescription>
              </div>
              {(filterName || filterStatus !== "todos") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterName("");
                    setFilterStatus("todos");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterName" className="text-sm font-medium">
                  Nome do Contrato
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="filterName"
                    placeholder="Buscar por nome..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filterStatus" className="text-sm font-medium">
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as "todos" | "ativo" | "inativo")}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">✓ Ativos</SelectItem>
                    <SelectItem value="inativo">✗ Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(filterName || filterStatus !== "todos") && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>{filteredContracts?.length || 0}</strong> contrato(s) encontrado(s)
                  {filterName && ` com "${filterName}"`}
                  {filterStatus !== "todos" && ` • Status: ${filterStatus}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>{filteredContracts?.length || 0} contrato(s) encontrado(s)</CardTitle>
            <CardDescription>Lista de contratos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredContracts && filteredContracts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Especial</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.name}</TableCell>
                      <TableCell>{contract.city || "-"}</TableCell>
                      <TableCell>{contract.state || "-"}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        {contract.validityDate
                          ? new Date(contract.validityDate).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {contract.isSpecial ? (
                          <Badge variant="secondary" className="bg-[#00b7ff] text-white">Sim</Badge>
                        ) : (
                          <Badge variant="outline">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={contract.isSpecial}
                            onClick={() => handleEdit(contract as Contract)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={contract.isSpecial}
                            onClick={() => handleDelete(contract as Contract)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Nenhum contrato encontrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de Edição */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
            <DialogDescription>
              Atualize os dados do contrato
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nome do Contrato *</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Digite o nome do contrato"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editCity">Cidade *</Label>
              <Input
                id="editCity"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="Digite o nome da cidade"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editState">UF *</Label>
              <Select value={editState} onValueChange={setEditState} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editValidityDate">Data de Validade</Label>
              <Input
                id="editValidityDate"
                type="date"
                value={editValidityDate}
                onChange={(e) => setEditValidityDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="editStatus">Status do Contrato</Label>
                <p className="text-sm text-muted-foreground">
                  {editStatus === "ativo" ? "Contrato ativo no sistema" : "Contrato inativo"}
                </p>
              </div>
              <Switch
                id="editStatus"
                checked={editStatus === "ativo"}
                onCheckedChange={(checked) => setEditStatus(checked ? "ativo" : "inativo")}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Exclusão Permanente</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Tem certeza que deseja <strong>excluir permanentemente</strong> o contrato:
                </p>
                <p className="font-semibold text-foreground">
                  {deletingContract?.name}
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ Esta ação não pode ser desfeita! O contrato será removido do banco de dados.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Sim, Excluir Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
