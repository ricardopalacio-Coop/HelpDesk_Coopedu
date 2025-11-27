import { useState, useMemo } from "react";
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
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { ESTADOS_BRASIL } from "../../../shared/brasil";
import { BANCOS_BRASIL } from "../../../shared/bancos";

type Cooperado = {
  id: number;
  registrationNumber: number;
  name: string;
  document: string;
  birthDate: string | null;
  admissionDate: string | null;
  associationDate: string | null;
  terminationDate: string | null;
  position: string | null;
  status: string;
  contractId: number | null;
  email: string | null;
  whatsappNumber: string | null;
  secondaryPhone: string | null;
  street: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: Date;
};

// Função para formatar CPF
const formatCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
  const [associationDate, setAssociationDate] = useState("");
  const [position, setPosition] = useState("");
  const [contractId, setContractId] = useState("");
  const [email, setEmail] = useState("");
  
  // Telefones
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+55");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [secondaryCountryCode, setSecondaryCountryCode] = useState("+55");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  
  // Endereço
  const [street, setStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // Dados Bancários
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState<"salario" | "corrente" | "poupanca">("corrente");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDigit, setAccountDigit] = useState("");
  const [pixKey, setPixKey] = useState("");
  
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
  
  // Telefones (edição)
  const [editWhatsappNumber, setEditWhatsappNumber] = useState("");
  const [editSecondaryPhone, setEditSecondaryPhone] = useState("");
  
  // Endereço (edição)
  const [editStreet, setEditStreet] = useState("");
  const [editAddressNumber, setEditAddressNumber] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [editComplement, setEditComplement] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  
  // Estados para exclusão
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingCooperado, setDeletingCooperado] = useState<Cooperado | null>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [contractFilter, setContractFilter] = useState<string>("todos");
  
  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const utils = trpc.useUtils();
  
  const createMutation = trpc.cooperados.create.useMutation({
    onSuccess: () => {
      toast.success("Cooperado criado com sucesso!");
      utils.cooperados.list.invalidate();
      setOpenCreate(false);
      // Limpar formulário
      setRegistrationNumber("");
      setName("");
      setDocument("");
      setBirthDate("");
      setAdmissionDate("");
      setPosition("");
      setContractId("");
      setEmail("");
      setWhatsappNumber("");
      setSecondaryPhone("");
      setStreet("");
      setAddressNumber("");
      setNeighborhood("");
      setComplement("");
      setCity("");
      setState("");
      setZipCode("");
      setBankCode("");
      setBankName("");
      setAccountType("corrente");
      setAgency("");
      setAccountNumber("");
      setAccountDigit("");
      setPixKey("");
    },
    onError: (error) => {
      toast.error(`Erro ao criar cooperado: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.cooperados.update.useMutation({
    onSuccess: () => {
      toast.success("Cooperado atualizado com sucesso!");
      utils.cooperados.list.invalidate();
      setOpenEdit(false);
      setEditingCooperado(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cooperado: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.cooperados.delete.useMutation({
    onSuccess: () => {
      toast.success("Cooperado excluído com sucesso!");
      utils.cooperados.list.invalidate();
      setOpenDelete(false);
      setDeletingCooperado(null);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cooperado: ${error.message}`);
    },
  });
  
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    createMutation.mutate({
      registrationNumber: parseInt(registrationNumber),
      name,
      document,
      birthDate: birthDate || undefined,
      admissionDate: admissionDate || undefined,
      position: position || undefined,
      contractId: (contractId && contractId !== "sem_contrato") ? parseInt(contractId) : undefined,
      email: email || undefined,
      whatsappNumber: whatsappNumber || undefined,
      secondaryPhone: secondaryPhone || undefined,
      street: street || undefined,
      addressNumber: addressNumber || undefined,
      neighborhood: neighborhood || undefined,
      complement: complement || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      // Dados Bancários
      bankCode: bankCode || undefined,
      bankName: bankName || undefined,
      accountType: accountType || undefined,
      agency: agency || undefined,
      accountNumber: accountNumber || undefined,
      accountDigit: accountDigit || undefined,
      pixKey: pixKey || undefined,
      status: "ativo",
    });
  };
  
  const handleEdit = (cooperado: Cooperado) => {
    setEditingCooperado(cooperado);
    setEditRegistrationNumber(cooperado.registrationNumber.toString());
    setEditName(cooperado.name);
    setEditDocument(cooperado.document);
    // Tratar datas que podem vir como string ou Date
    setEditBirthDate(cooperado.birthDate ? (typeof cooperado.birthDate === 'string' ? cooperado.birthDate.split('T')[0] : new Date(cooperado.birthDate).toISOString().split('T')[0]) : "");
    setEditAdmissionDate(cooperado.admissionDate ? (typeof cooperado.admissionDate === 'string' ? cooperado.admissionDate.split('T')[0] : new Date(cooperado.admissionDate).toISOString().split('T')[0]) : "");
    setEditTerminationDate(cooperado.terminationDate ? (typeof cooperado.terminationDate === 'string' ? cooperado.terminationDate.split('T')[0] : new Date(cooperado.terminationDate).toISOString().split('T')[0]) : "");
    setEditPosition(cooperado.position || "");
    setEditStatus(cooperado.status as "ativo" | "inativo" | "sem_producao");
    setEditContractId(cooperado.contractId ? cooperado.contractId.toString() : "sem_contrato");
    setEditEmail(cooperado.email || "");
    setEditWhatsappNumber(cooperado.whatsappNumber || "");
    setEditSecondaryPhone(cooperado.secondaryPhone || "");
    setEditStreet(cooperado.street || "");
    setEditAddressNumber(cooperado.addressNumber || "");
    setEditNeighborhood(cooperado.neighborhood || "");
    setEditComplement(cooperado.complement || "");
    setEditCity(cooperado.city || "");
    setEditState(cooperado.state || "");
    setEditZipCode(cooperado.zipCode || "");
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
      contractId: (editContractId && editContractId !== "sem_contrato") ? parseInt(editContractId) : undefined,
      email: editEmail || undefined,
      whatsappNumber: editWhatsappNumber || undefined,
      secondaryPhone: editSecondaryPhone || undefined,
      street: editStreet || undefined,
      addressNumber: editAddressNumber || undefined,
      neighborhood: editNeighborhood || undefined,
      complement: editComplement || undefined,
      city: editCity || undefined,
      state: editState || undefined,
      zipCode: editZipCode || undefined,
    });
  };
  
  const handleDelete = (cooperado: Cooperado) => {
    setDeletingCooperado(cooperado);
    setOpenDelete(true);
  };
  
  const confirmDelete = () => {
    if (deletingCooperado) {
      deleteMutation.mutate({ id: deletingCooperado.id });
    }
  };
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };
  
  // Filtros e ordenação
  const filteredCooperados = useMemo(() => {
    if (!cooperados) return [] as Cooperado[];
    
    let filtered = cooperados.filter((cooperado) => {
      const matchesSearch = 
        cooperado.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cooperado.registrationNumber.toString().includes(searchTerm) ||
        cooperado.document.includes(searchTerm);
      
      const matchesStatus = statusFilter === "todos" || cooperado.status === statusFilter;
      
      const matchesContract = 
        contractFilter === "todos" || 
        (contractFilter === "sem_contrato" && !cooperado.contractId) ||
        (cooperado.contractId && cooperado.contractId.toString() === contractFilter);
      
      return matchesSearch && matchesStatus && matchesContract;
    });
    
    // Aplicar ordenação
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn as keyof Cooperado];
        let bValue = b[sortColumn as keyof Cooperado];
        
        // Tratar valores nulos
        if (aValue === null) aValue = "";
        if (bValue === null) bValue = "";
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return filtered as Cooperado[];
  }, [cooperados, searchTerm, statusFilter, contractFilter, sortColumn, sortDirection]);
  
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setContractFilter("todos");
  };
  
  const exportToXLS = () => {
    const data = filteredCooperados.map((c) => ({
      "Matricula": c.registrationNumber,
      "Nome": c.name,
      "CPF": formatCPF(c.document),
      "Cargo": c.position || "",
      "Status": c.status === "ativo" ? "ATIVO" : c.status === "inativo" ? "INATIVO" : "SEM PRODUCAO",
      "Contrato": contracts?.find(ct => ct.id === c.contractId)?.name || "SEM CONTRATO",
      "Email": c.email || "",
      "WhatsApp": c.whatsappNumber || "",
      "Telefone Secundario": c.secondaryPhone || "",
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cooperados");
    XLSX.writeFile(wb, `cooperados_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Arquivo XLS exportado com sucesso!");
  };
  
  const exportToCSV = () => {
    const headers = ["Matricula", "Nome", "CPF", "Cargo", "Status", "Contrato", "Email", "WhatsApp", "Telefone Secundario"];
    const rows = filteredCooperados.map((c) => [
      c.registrationNumber,
      c.name,
      formatCPF(c.document),
      c.position || "",
      c.status === "ativo" ? "ATIVO" : c.status === "inativo" ? "INATIVO" : "SEM PRODUCAO",
      contracts?.find(ct => ct.id === c.contractId)?.name || "SEM CONTRATO",
      c.email || "",
      c.whatsappNumber || "",
      c.secondaryPhone || "",
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
  
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cooperados</CardTitle>
              <CardDescription>Gerencie os cooperados do sistema</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToXLS}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar XLS
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cooperado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Cooperado</DialogTitle>
                    <DialogDescription>Preencha os dados do novo cooperado</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-6">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-blue-700">Dados Pessoais</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="registrationNumber" className="text-red-600 mb-2 block">Matricula *</Label>
                          <Input
                            id="registrationNumber"
                            type="number"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="document" className="text-red-600 mb-2 block">CPF *</Label>
                          <Input
                            id="document"
                            value={document}
                            onChange={(e) => setDocument(e.target.value)}
                            placeholder="000.000.000-00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-red-600 mb-2 block">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="birthDate" className="mb-2 block">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="admissionDate" className="mb-2 block">Data de Admissao</Label>
                          <Input
                            id="admissionDate"
                            type="date"
                            value={admissionDate}
                            onChange={(e) => setAdmissionDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="position" className="mb-2 block">Cargo</Label>
                          <Input
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contractId" className="mb-2 block">Contrato</Label>
                          <Select value={contractId} onValueChange={setContractId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o contrato" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sem_contrato">Sem contrato</SelectItem>
                              {contracts?.filter(c => c.status === "ativo").map((contract) => (
                                <SelectItem key={contract.id} value={contract.id.toString()}>
                                  {contract.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="email" className="mb-2 block">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Telefones */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-blue-700">Telefones</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="whatsappNumber" className="mb-2 block">Nr WhatsApp</Label>
                          <div className="flex gap-2">
                            <Input
                              value="+55"
                              disabled
                              className="w-20"
                            />
                            <Input
                              id="whatsappNumber"
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                              placeholder="(00) 00000-0000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondaryPhone" className="mb-2 block">Telefone Secundario</Label>
                          <div className="flex gap-2">
                            <Input
                              value="+55"
                              disabled
                              className="w-20"
                            />
                            <Input
                              id="secondaryPhone"
                              value={secondaryPhone}
                              onChange={(e) => setSecondaryPhone(e.target.value)}
                              placeholder="(00) 0000-0000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Endereço */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-blue-700">Endereco</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="street" className="mb-2 block">Logradouro</Label>
                          <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressNumber" className="mb-2 block">Numero</Label>
                          <Input
                            id="addressNumber"
                            value={addressNumber}
                            onChange={(e) => setAddressNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="neighborhood" className="mb-2 block">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="complement" className="mb-2 block">Complemento</Label>
                          <Input
                            id="complement"
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                            placeholder="Apto, Bloco, etc."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city" className="mb-2 block">Cidade</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="mb-2 block">UF</Label>
                          <Select value={state} onValueChange={setState}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {ESTADOS_BRASIL.map((uf) => (
                                <SelectItem key={uf.sigla} value={uf.sigla}>
                                  {uf.sigla} - {uf.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="mb-2 block">CEP</Label>
                          <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Dados Bancários */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-blue-700">Dados Bancarios</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankCode" className="mb-2 block">Codigo do Banco</Label>
                          <Input
                            id="bankCode"
                            value={bankCode}
                            onChange={(e) => setBankCode(e.target.value)}
                            placeholder="000"
                            maxLength={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bankName" className="mb-2 block">Nome do Banco</Label>
                          <Input
                            id="bankName"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Ex: Banco do Brasil"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="accountType" className="mb-2 block">Tipo de Conta</Label>
                          <Select value={accountType} onValueChange={(v) => setAccountType(v as "salario" | "corrente" | "poupanca")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salario">Salario</SelectItem>
                              <SelectItem value="corrente">Corrente</SelectItem>
                              <SelectItem value="poupanca">Poupanca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="agency" className="mb-2 block">Agencia</Label>
                          <Input
                            id="agency"
                            value={agency}
                            onChange={(e) => setAgency(e.target.value)}
                            placeholder="0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber" className="mb-2 block">Conta</Label>
                          <Input
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="00000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="accountDigit" className="mb-2 block">Digito</Label>
                          <Input
                            id="accountDigit"
                            value={accountDigit}
                            onChange={(e) => setAccountDigit(e.target.value)}
                            placeholder="0"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pixKey" className="mb-2 block">Chave PIX</Label>
                          <Input
                            id="pixKey"
                            value={pixKey}
                            onChange={(e) => setPixKey(e.target.value)}
                            placeholder="CPF, Email, Telefone ou Chave Aleatoria"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
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
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, matricula ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="sem_producao">Sem Producao</SelectItem>
                </SelectContent>
              </Select>
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os contratos</SelectItem>
                  <SelectItem value="sem_contrato">Sem contrato</SelectItem>
                  {contracts?.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id.toString()}>
                      {contract.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== "todos" || contractFilter !== "todos") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredCooperados.length} de {cooperados?.length || 0} cooperados
            </div>
          </div>
          
          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("registrationNumber")}>
                    Matricula {getSortIcon("registrationNumber")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    Nome {getSortIcon("name")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("document")}>
                    CPF {getSortIcon("document")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("position")}>
                    Cargo {getSortIcon("position")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    Status {getSortIcon("status")}
                  </TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCooperados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum cooperado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCooperados.map((cooperado: Cooperado) => (
                    <TableRow key={cooperado.id}>
                      <TableCell className="font-medium">{cooperado.registrationNumber}</TableCell>
                      <TableCell>{cooperado.name}</TableCell>
                      <TableCell>{formatCPF(cooperado.document)}</TableCell>
                      <TableCell>{cooperado.position || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          cooperado.status === "ativo" ? "default" : 
                          cooperado.status === "inativo" ? "secondary" : 
                          "outline"
                        }>
                          {cooperado.status === "ativo" ? "ATIVO" : 
                           cooperado.status === "inativo" ? "INATIVO" : 
                           "SEM PRODUCAO"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cooperado.contractId 
                          ? contracts?.find(c => c.id === cooperado.contractId)?.name || "-"
                          : "SEM CONTRATO"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cooperado)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cooperado)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Edição */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cooperado</DialogTitle>
            <DialogDescription>Atualize os dados do cooperado</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editRegistrationNumber">Matricula</Label>
                  <Input
                    id="editRegistrationNumber"
                    value={editRegistrationNumber}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="editDocument">CPF *</Label>
                  <Input
                    id="editDocument"
                    value={editDocument}
                    onChange={(e) => setEditDocument(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editName">Nome Completo *</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editBirthDate">Data de Nascimento</Label>
                  <Input
                    id="editBirthDate"
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editAdmissionDate">Data de Admissao</Label>
                  <Input
                    id="editAdmissionDate"
                    type="date"
                    value={editAdmissionDate}
                    onChange={(e) => setEditAdmissionDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editTerminationDate">Data de Demissao</Label>
                  <Input
                    id="editTerminationDate"
                    type="date"
                    value={editTerminationDate}
                    onChange={(e) => setEditTerminationDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editPosition">Cargo</Label>
                  <Input
                    id="editPosition"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Status *</Label>
                  <Select value={editStatus} onValueChange={(value: "ativo" | "inativo" | "sem_producao") => setEditStatus(value)}>
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
                <div>
                  <Label htmlFor="editContractId">Contrato</Label>
                  <Select value={editContractId} onValueChange={setEditContractId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sem_contrato">Sem contrato</SelectItem>
                      {contracts?.filter(c => c.status === "ativo").map((contract) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          {contract.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Telefones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Telefones</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editWhatsappNumber">Nr WhatsApp</Label>
                  <Input
                    id="editWhatsappNumber"
                    value={editWhatsappNumber}
                    onChange={(e) => setEditWhatsappNumber(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="editSecondaryPhone">Telefone Secundario</Label>
                  <Input
                    id="editSecondaryPhone"
                    value={editSecondaryPhone}
                    onChange={(e) => setEditSecondaryPhone(e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>
            </div>
            
            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Endereco</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="editStreet">Logradouro</Label>
                  <Input
                    id="editStreet"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="editAddressNumber">Numero</Label>
                  <Input
                    id="editAddressNumber"
                    value={editAddressNumber}
                    onChange={(e) => setEditAddressNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editNeighborhood">Bairro</Label>
                  <Input
                    id="editNeighborhood"
                    value={editNeighborhood}
                    onChange={(e) => setEditNeighborhood(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editComplement">Complemento</Label>
                  <Input
                    id="editComplement"
                    value={editComplement}
                    onChange={(e) => setEditComplement(e.target.value)}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editCity">Cidade</Label>
                  <Input
                    id="editCity"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editState">UF</Label>
                  <Select value={editState} onValueChange={setEditState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASIL.map((uf) => (
                        <SelectItem key={uf.sigla} value={uf.sigla}>
                          {uf.sigla} - {uf.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editZipCode">CEP</Label>
                  <Input
                    id="editZipCode"
                    value={editZipCode}
                    onChange={(e) => setEditZipCode(e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Atualizando..." : "Atualizar Cooperado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Exclusão */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="text-destructive font-semibold">
                  ATENCAO: Esta acao NAO pode ser desfeita!
                </p>
                <p>
                  Voce esta prestes a excluir permanentemente o cooperado:
                </p>
                <p className="font-semibold">
                  {deletingCooperado?.name} (Matricula: {deletingCooperado?.registrationNumber})
                </p>
                <p>
                  Todos os dados relacionados serao removidos do sistema.
                </p>
                <p className="font-semibold">
                  Deseja realmente continuar?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
