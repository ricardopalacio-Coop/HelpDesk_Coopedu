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
import { Plus, Pencil, Trash2, Search, FileSpreadsheet, FileText, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

type Cooperado = {
  id: number;
  registrationNumber: number;
  name: string;
  document: string;
  birthDate: string | null;
  admissionDate: string | null;
  terminationDate: string | null;
  position: string | null;
  status: string;
  contractId: number | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
};

export default function Cooperados() {
  const { data: cooperados, isLoading } = trpc.cooperados.list.useQuery(undefined);
  const { data: contracts } = trpc.contracts.list.useQuery();
  
  // Estados para modal de criação
  const [openCreate, setOpenCreate] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [position, setPosition] = useState("");
  const [contractId, setContractId] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  
  // Estados para modal de edição
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCooperado, setEditingCooperado] = useState<Cooperado | null>(null);
  const [editRegistrationNumber, setEditRegistrationNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editDocument, setEditDocument] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editAdmissionDate, setEditAdmissionDate] = useState("");
  const [editTerminationDate, setEditTerminationDate] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editStatus, setEditStatus] = useState<"ativo" | "inativo" | "sem_producao">("ativo");
  const [editContractId, setEditContractId] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  
  // Estados para exclusão
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingCooperado, setDeletingCooperado] = useState<Cooperado | null>(null);
  
  // Estados para filtros
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativo" | "inativo" | "sem_producao">("todos");
  const [filterContract, setFilterContract] = useState<string>("todos");
  
  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState<keyof Cooperado | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const utils = trpc.useUtils();
  
  // Mutation para criar cooperado
  const createMutation = trpc.cooperados.create.useMutation({
    onSuccess: () => {
      toast.success("Cooperado criado com sucesso!");
      setOpenCreate(false);
      resetCreateForm();
      utils.cooperados.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao criar cooperado: ${error.message}`);
    },
  });
  
  // Mutation para atualizar cooperado
  const updateMutation = trpc.cooperados.update.useMutation({
    onSuccess: () => {
      toast.success("Cooperado atualizado com sucesso!");
      setOpenEdit(false);
      setEditingCooperado(null);
      utils.cooperados.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cooperado: ${error.message}`);
    },
  });
  
  // Mutation para excluir cooperado
  const deleteMutation = trpc.cooperados.delete.useMutation({
    onSuccess: () => {
      toast.success("Cooperado excluído com sucesso!");
      setOpenDelete(false);
      setDeletingCooperado(null);
      utils.cooperados.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cooperado: ${error.message}`);
    },
  });
  
  const resetCreateForm = () => {
    setRegistrationNumber("");
    setName("");
    setDocument("");
    setBirthDate("");
    setAdmissionDate("");
    setPosition("");
    setContractId("");
    setEmail("");
    setAddress("");
  };
  
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    createMutation.mutate({
      registrationNumber: parseInt(registrationNumber),
      name,
      document,
      birthDate: birthDate || undefined,
      admissionDate: admissionDate || undefined,
      position: position || undefined,
      contractId: contractId ? parseInt(contractId) : undefined,
      email: email || undefined,
      address: address || undefined,
      status: "ativo",
    });
  };
  
  const handleEdit = (cooperado: Cooperado) => {
    setEditingCooperado(cooperado);
    setEditRegistrationNumber(cooperado.registrationNumber.toString());
    setEditName(cooperado.name);
    setEditDocument(cooperado.document);
    setEditBirthDate(cooperado.birthDate ? cooperado.birthDate.split('T')[0] : "");
    setEditAdmissionDate(cooperado.admissionDate ? cooperado.admissionDate.split('T')[0] : "");
    setEditTerminationDate(cooperado.terminationDate ? cooperado.terminationDate.split('T')[0] : "");
    setEditPosition(cooperado.position || "");
    setEditStatus(cooperado.status as "ativo" | "inativo" | "sem_producao");
    setEditContractId(cooperado.contractId ? cooperado.contractId.toString() : "");
    setEditEmail(cooperado.email || "");
    setEditAddress(cooperado.address || "");
    setOpenEdit(true);
  };
  
  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editingCooperado) return;
    
    updateMutation.mutate({
      id: editingCooperado.id,
      name: editName,
      document: editDocument,
      birthDate: editBirthDate || undefined,
      admissionDate: editAdmissionDate || undefined,
      terminationDate: editTerminationDate || undefined,
      position: editPosition || undefined,
      status: editStatus,
      contractId: editContractId ? parseInt(editContractId) : undefined,
      email: editEmail || undefined,
      address: editAddress || undefined,
    });
  };
  
  const handleDelete = (cooperado: Cooperado) => {
    setDeletingCooperado(cooperado);
    setOpenDelete(true);
  };
  
  const confirmDelete = () => {
    if (!deletingCooperado) return;
    
    deleteMutation.mutate({
      id: deletingCooperado.id,
    });
  };
  
  // Filtrar e ordenar cooperados
  const filteredCooperados = useMemo(() => {
    if (!cooperados) return [];
    
    // Filtrar
    let filtered = cooperados.filter((cooperado) => {
      const matchName = filterName === "" || 
        cooperado.name.toLowerCase().includes(filterName.toLowerCase()) ||
        cooperado.registrationNumber.toString().includes(filterName);
      
      const matchStatus = filterStatus === "todos" || 
        cooperado.status === filterStatus;
      
      const matchContract = filterContract === "todos" ||
        (filterContract === "sem_contrato" && !cooperado.contractId) ||
        cooperado.contractId?.toString() === filterContract;
      
      return matchName && matchStatus && matchContract;
    });
    
    // Ordenar
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn] as any;
        const bValue = b[sortColumn] as any;
        
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortDirection === "asc" ? 1 : -1;
        if (bValue === null) return sortDirection === "asc" ? -1 : 1;
        
        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        }
        
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }
    
    return filtered;
  }, [cooperados, filterName, filterStatus, filterContract, sortColumn, sortDirection]);
  
  const handleSort = (column: keyof Cooperado) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Exportar para XLS
  const exportToXLS = () => {
    if (!filteredCooperados || filteredCooperados.length === 0) {
      toast.error("Nenhum cooperado para exportar");
      return;
    }
    
    const data = filteredCooperados.map((cooperado) => ({
      Matricula: cooperado.registrationNumber,
      Nome: cooperado.name,
      CPF: cooperado.document,
      Cargo: cooperado.position || "-",
      Status: cooperado.status,
      Contrato: contracts?.find(c => c.id === cooperado.contractId)?.name || "-",
      Email: cooperado.email || "-",
      "Data Admissao": cooperado.admissionDate
        ? new Date(cooperado.admissionDate).toLocaleDateString("pt-BR")
        : "-",
      "Criado em": new Date(cooperado.createdAt).toLocaleDateString("pt-BR"),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cooperados");
    XLSX.writeFile(wb, `cooperados_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Arquivo XLS exportado com sucesso!");
  };
  
  // Exportar para CSV
  const exportToCSV = () => {
    if (!filteredCooperados || filteredCooperados.length === 0) {
      toast.error("Nenhum cooperado para exportar");
      return;
    }
    
    const headers = ["Matricula", "Nome", "CPF", "Cargo", "Status", "Contrato", "Email", "Data Admissao", "Criado em"];
    const rows = filteredCooperados.map((cooperado) => [
      cooperado.registrationNumber,
      cooperado.name,
      cooperado.document,
      cooperado.position || "-",
      cooperado.status,
      contracts?.find(c => c.id === cooperado.contractId)?.name || "-",
      cooperado.email || "-",
      cooperado.admissionDate
        ? new Date(cooperado.admissionDate).toLocaleDateString("pt-BR")
        : "-",
      new Date(cooperado.createdAt).toLocaleDateString("pt-BR"),
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = window.document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cooperados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("Arquivo CSV exportado com sucesso!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="default" className="bg-[#3ab54a]">Ativo</Badge>;
      case "inativo":
        return <Badge variant="destructive">Inativo</Badge>;
      case "sem_producao":
        return <Badge variant="secondary">Sem Producao</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cooperados</h1>
            <p className="text-muted-foreground">Gerencie os cooperados do sistema</p>
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
                  Novo Cooperado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Cooperado</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do cooperado
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Matrícula *</Label>
                      <Input
                        id="registrationNumber"
                        type="number"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="Digite a matrícula"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="document">CPF *</Label>
                      <Input
                        id="document"
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Digite o cargo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contractId">Contrato</Label>
                      <Select value={contractId} onValueChange={setContractId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem contrato</SelectItem>
                          {contracts?.filter(c => c.status === "ativo").map((contract) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate">Data de Admissão</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Digite o endereço completo"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Criando..." : "Criar Cooperado"}
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
                <CardDescription>Refine sua pesquisa de cooperados</CardDescription>
              </div>
              {(filterName || filterStatus !== "todos" || filterContract !== "todos") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterName("");
                    setFilterStatus("todos");
                    setFilterContract("todos");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterName" className="text-sm font-medium">
                  Nome ou Matrícula
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="filterName"
                    placeholder="Buscar por nome ou matrícula..."
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
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">✓ Ativos</SelectItem>
                    <SelectItem value="inativo">✗ Inativos</SelectItem>
                    <SelectItem value="sem_producao">⊘ Sem Producao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filterContract" className="text-sm font-medium">
                  Contrato
                </Label>
                <Select value={filterContract} onValueChange={setFilterContract}>
                  <SelectTrigger id="filterContract">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Contratos</SelectItem>
                    <SelectItem value="sem_contrato">Sem Contrato</SelectItem>
                    {contracts?.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(filterName || filterStatus !== "todos" || filterContract !== "todos") && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>{filteredCooperados?.length || 0}</strong> cooperado(s) encontrado(s)
                  {filterName && ` com "${filterName}"`}
                  {filterStatus !== "todos" && ` • Status: ${filterStatus}`}
                  {filterContract !== "todos" && ` • Contrato: ${filterContract === "sem_contrato" ? "Sem contrato" : contracts?.find(c => c.id.toString() === filterContract)?.name}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>{filteredCooperados?.length || 0} cooperado(s) encontrado(s)</CardTitle>
            <CardDescription>Lista de cooperados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredCooperados && filteredCooperados.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort("registrationNumber")} className="-ml-3 h-8">
                          Matrícula
                          {sortColumn === "registrationNumber" ? (
                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort("name")} className="-ml-3 h-8">
                          Nome
                          {sortColumn === "name" ? (
                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort("document")} className="-ml-3 h-8">
                          CPF
                          {sortColumn === "document" ? (
                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort("position")} className="-ml-3 h-8">
                          Cargo
                          {sortColumn === "position" ? (
                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort("status")} className="-ml-3 h-8">
                          Status
                          {sortColumn === "status" ? (
                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Contrato</TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort("admissionDate")} className="-ml-3 h-8">
                          Admissao
                          {sortColumn === "admissionDate" ? (
                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCooperados.map((cooperado) => (
                      <TableRow key={cooperado.id}>
                        <TableCell className="font-medium">{cooperado.registrationNumber}</TableCell>
                        <TableCell>{cooperado.name}</TableCell>
                        <TableCell>{cooperado.document}</TableCell>
                        <TableCell>{cooperado.position || "-"}</TableCell>
                        <TableCell>{getStatusBadge(cooperado.status)}</TableCell>
                        <TableCell>
                          {cooperado.contractId 
                            ? contracts?.find(c => c.id === cooperado.contractId)?.name || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {cooperado.admissionDate
                            ? new Date(cooperado.admissionDate).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(cooperado as Cooperado)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(cooperado as Cooperado)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Nenhum cooperado encontrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de Edição */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cooperado</DialogTitle>
            <DialogDescription>
              Atualize os dados do cooperado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRegistrationNumber">Matrícula *</Label>
                <Input
                  id="editRegistrationNumber"
                  type="number"
                  value={editRegistrationNumber}
                  onChange={(e) => setEditRegistrationNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDocument">CPF *</Label>
                <Input
                  id="editDocument"
                  value={editDocument}
                  onChange={(e) => setEditDocument(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editName">Nome Completo *</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPosition">Cargo</Label>
                <Input
                  id="editPosition"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status *</Label>
                <Select value={editStatus} onValueChange={(value) => setEditStatus(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="sem_producao">Sem Producao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editContractId">Contrato</Label>
              <Select value={editContractId} onValueChange={setEditContractId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem contrato</SelectItem>
                  {contracts?.filter(c => c.status === "ativo").map((contract) => (
                    <SelectItem key={contract.id} value={contract.id.toString()}>
                      {contract.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editBirthDate">Data de Nascimento</Label>
                <Input
                  id="editBirthDate"
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editAdmissionDate">Data de Admissão</Label>
                <Input
                  id="editAdmissionDate"
                  type="date"
                  value={editAdmissionDate}
                  onChange={(e) => setEditAdmissionDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editTerminationDate">Data de Desligamento</Label>
                <Input
                  id="editTerminationDate"
                  type="date"
                  value={editTerminationDate}
                  onChange={(e) => setEditTerminationDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editEmail">E-mail</Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editAddress">Endereço</Label>
              <Input
                id="editAddress"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
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
                  Tem certeza que deseja <strong>excluir permanentemente</strong> o cooperado:
                </p>
                <p className="font-semibold text-foreground">
                  {deletingCooperado?.name} (Matrícula: {deletingCooperado?.registrationNumber})
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ Esta ação não pode ser desfeita! O cooperado será removido do banco de dados.
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
