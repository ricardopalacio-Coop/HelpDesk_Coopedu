import { useState, useMemo, useEffect } from "react";
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
import { Plus, Pencil, Trash2, Search, FileSpreadsheet, FileText, X, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, AlertCircle, Loader2, CreditCard } from "lucide-react";
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
import { IMaskInput } from 'react-imask';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { data: cooperados, isLoading } = trpc.cooperados.list.useQuery(undefined) as { data: Cooperado[] | undefined, isLoading: boolean };
  const { data: contracts } = trpc.contracts.list.useQuery();
  
  // Estados para modal de criação
  const [openCreate, setOpenCreate] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [associationDate, setAssociationDate] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("ativo");
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
  const [loadingCep, setLoadingCep] = useState(false);
  
  // Dados Bancários
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState<"salario" | "corrente" | "poupanca">("corrente");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDigit, setAccountDigit] = useState("");
  const [pixKey, setPixKey] = useState("");
  
  // Validação de campos
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Buscar CEP automaticamente
  const handleCepChange = async (cep: string) => {
    setZipCode(cep);
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setStreet(data.logradouro || "");
          setNeighborhood(data.bairro || "");
          setCity(data.localidade || "");
          setState(data.uf || "");
          toast.success("Endereço preenchido automaticamente!");
        } else {
          toast.error("CEP não encontrado");
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP");
      } finally {
        setLoadingCep(false);
      }
    }
  };
  
  // Atualizar PIX automaticamente quando CPF mudar
  useEffect(() => {
    const cleanDoc = document.replace(/\D/g, '');
    if (cleanDoc && cleanDoc.length >= 11) {
      setPixKey(cleanDoc);
    }
  }, [document]);
  
  // Validar campos obrigatórios
  const isFormValid = () => {
    return registrationNumber && name && document.replace(/\D/g, '').length === 11;
  };
  
  // Marcar campo como tocado
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  // Estados para modal de edição
  const [openEdit, setOpenEdit] = useState(false);
  
  // Estados para modal de dados bancários
  const [openBankData, setOpenBankData] = useState(false);
  const [selectedCooperadoId, setSelectedCooperadoId] = useState<number | null>(null);
  
  // Query para buscar dados bancários
  const { data: bankData, isLoading: isBankDataLoading } = trpc.cooperados.bankData.get.useQuery(
    { cooperadoId: selectedCooperadoId! },
    { enabled: selectedCooperadoId !== null }
  );
  const [editingCooperado, setEditingCooperado] = useState<Cooperado | null>(null);
  const [editRegistrationNumber, setEditRegistrationNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editDocument, setEditDocument] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editTerminationDate, setEditTerminationDate] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editStatus, setEditStatus] = useState<"ativo" | "inativo" | "desligado">("ativo");
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
      resetForm();
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
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cooperado: ${error.message}`);
    },
  });
  
  const resetForm = () => {
    setRegistrationNumber("");
    setName("");
    setDocument("");
    setBirthDate("");
    setAssociationDate("");
    setPosition("");
    setStatus("ativo");
    setContractId("");
    setEmail("");
    setWhatsappCountryCode("+55");
    setWhatsappNumber("");
    setSecondaryCountryCode("+55");
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
    setTouched({});
  };
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate({
      registrationNumber: parseInt(registrationNumber),
      name,
      document: document.replace(/\D/g, ''),
      birthDate: birthDate || undefined,
      associationDate: associationDate || undefined,
      position: position || undefined,
      status: status as "ativo" | "inativo" | "desligado",
      contractId: contractId === "sem_contrato" ? undefined : parseInt(contractId),
      email: email || undefined,
      whatsappNumber: whatsappNumber ? `${whatsappCountryCode} ${whatsappNumber}` : undefined,
      secondaryPhone: secondaryPhone ? `${secondaryCountryCode} ${secondaryPhone}` : undefined,
      street: street || undefined,
      addressNumber: addressNumber || undefined,
      neighborhood: neighborhood || undefined,
      complement: complement || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode ? zipCode.replace(/\D/g, '') : undefined,
      // Dados bancários (campos individuais, não objeto aninhado)
      bankCode: bankCode || undefined,
      bankName: bankName || undefined,
      accountType: bankCode ? accountType : undefined,
      agency: agency || undefined,
      accountNumber: accountNumber || undefined,
      accountDigit: accountDigit || undefined,
      pixKey: pixKey || undefined,
    });
  };
  
  const handleEdit = (cooperado: Cooperado) => {
    setEditingCooperado(cooperado);
    setEditRegistrationNumber(cooperado.registrationNumber.toString());
    setEditName(cooperado.name);
    setEditDocument(cooperado.document);
    
    // Tratamento robusto de datas
    const formatDateForInput = (date: string | Date | null) => {
      if (!date) return "";
      const dateStr = String(date);
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return dateStr;
    };
    
    setEditBirthDate(formatDateForInput(cooperado.birthDate));
    setEditTerminationDate(formatDateForInput(cooperado.terminationDate));
    setEditPosition(cooperado.position || "");
    setEditStatus(cooperado.status as "ativo" | "inativo" | "desligado");
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
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCooperado) return;
    
    updateMutation.mutate({
      id: editingCooperado.id,
      name: editName,
      document: editDocument,
      birthDate: editBirthDate || undefined,
      terminationDate: editTerminationDate || undefined,
      position: editPosition || undefined,
      status: editStatus,
      contractId: editContractId === "sem_contrato" ? undefined : parseInt(editContractId),
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
    if (!deletingCooperado) return;
    deleteMutation.mutate({ id: deletingCooperado.id });
  };
  
  // Filtrar e ordenar cooperados
  const filteredCooperados: Cooperado[] | undefined = cooperados?.filter((cooperado) => {
    const matchesSearch = cooperado.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cooperado.document.includes(searchTerm);
    const matchesStatus = statusFilter === "todos" || cooperado.status === statusFilter;
    const matchesContract = contractFilter === "todos" || 
                           (contractFilter === "sem_contrato" && !cooperado.contractId) ||
                           cooperado.contractId?.toString() === contractFilter;
    return matchesSearch && matchesStatus && matchesContract;
  });
  
  const sortedCooperados: Cooperado[] | undefined = filteredCooperados ? [...filteredCooperados].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any = a[sortColumn as keyof Cooperado];
    let bValue: any = b[sortColumn as keyof Cooperado];
    
    // Tratamento de valores nulos
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // Comparação
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }) : undefined;
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-2 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-4 w-4 ml-2" /> : 
      <ArrowDown className="h-4 w-4 ml-2" />;
  };
  
  const exportToXLS = () => {
    if (!filteredCooperados) return;
    
    const data = filteredCooperados.map((c) => ({
      ID: c.id,
      Matricula: c.registrationNumber,
      Nome: c.name,
      CPF: formatCPF(c.document),
      Cargo: c.position || "",
      Status: c.status === "ativo" ? "ATIVO" : c.status === "inativo" ? "INATIVO" : "DESLIGADO",
      Contrato: contracts?.find(ct => ct.id === c.contractId)?.name || "SEM CONTRATO",
      Email: c.email || "",
      WhatsApp: c.whatsappNumber || "",
      Telefone: c.secondaryPhone || "",
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cooperados");
    XLSX.writeFile(wb, `cooperados_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Arquivo XLS exportado com sucesso!");
  };
  
  const exportToCSV = () => {
    if (!filteredCooperados) return;
    
    const headers = ["ID", "Matricula", "Nome", "CPF", "Cargo", "Status", "Contrato", "Email", "WhatsApp", "Telefone"];
    const rows = filteredCooperados.map((c) => [
      c.id,
      c.registrationNumber,
      c.name,
      formatCPF(c.document),
      c.position || "",
      c.status === "ativo" ? "ATIVO" : c.status === "inativo" ? "INATIVO" : "DESLIGADO",
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
    <Layout>
      <div className="space-y-6">
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
                <DialogContent className="w-[95vw] max-w-[1600px] max-h-[90vh] overflow-y-auto p-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Novo Cooperado</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo cooperado. Campos marcados com <span className="text-red-600">*</span> são obrigatórios.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-8">
                    {/* Indicador de Progresso */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isFormValid() ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span className="font-medium text-sm">
                            {isFormValid() ? "Formulário pronto para envio" : "Preencha os campos obrigatórios"}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {[registrationNumber, name, document.replace(/\D/g, '').length === 11].filter(Boolean).length} de 3 campos obrigatórios preenchidos
                        </span>
                      </div>
                    </div>
                    
                    {/* Dados Pessoais */}
                    <div className="space-y-4 bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                        Dados Pessoais
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Label htmlFor="registrationNumber" className="text-red-600 mb-2 block font-medium">
                                  Matrícula *
                                </Label>
                                <Input
                                  id="registrationNumber"
                                  type="number"
                                  value={registrationNumber}
                                  onChange={(e) => setRegistrationNumber(e.target.value)}
                                  onBlur={() => handleBlur('registrationNumber')}
                                  required
                                  className={touched.registrationNumber && !registrationNumber ? "border-red-500" : ""}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Número único de identificação do cooperado</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <div>
                          <Label htmlFor="associationDate" className="mb-2 block font-medium">Data Associação</Label>
                          <Input
                            id="associationDate"
                            type="date"
                            value={associationDate}
                            onChange={(e) => setAssociationDate(e.target.value)}
                          />
                        </div>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Label htmlFor="document" className="text-red-600 mb-2 block font-medium">
                                  CPF *
                                </Label>
                                <IMaskInput
                                  mask="000.000.000-00"
                                  definitions={{
                                    '0': /[0-9]/
                                  }}
                                  value={document}
                                  onAccept={(value: string) => setDocument(value)}
                                  onBlur={() => handleBlur('document')}
                                  placeholder="000.000.000-00"
                                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${touched.document && document.replace(/\D/g, '').length !== 11 ? "border-red-500" : ""}`}
                                />
                                {touched.document && document.replace(/\D/g, '').length > 0 && document.replace(/\D/g, '').length !== 11 && (
                                  <p className="text-xs text-red-600 mt-1">CPF deve ter 11 dígitos</p>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>CPF será usado como chave PIX padrão</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <div>
                          <Label htmlFor="status" className="mb-2 block font-medium">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="inativo">Inativo</SelectItem>
                              <SelectItem value="desligado">Desligado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="name" className="text-red-600 mb-2 block font-medium">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => handleBlur('name')}
                          required
                          className={touched.name && !name ? "border-red-500" : ""}
                          placeholder="Digite o nome completo do cooperado"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="birthDate" className="mb-2 block font-medium">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="position" className="mb-2 block font-medium">Cargo</Label>
                          <Input
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Ex: Analista, Gerente, etc."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="contractId" className="mb-2 block font-medium">Contrato</Label>
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
                          <Label htmlFor="email" className="mb-2 block font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Telefones */}
                    <div className="space-y-4 bg-gradient-to-r from-green-50 to-transparent p-6 rounded-lg border border-green-100">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                        <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                        Telefones
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="whatsappNumber" className="mb-2 block font-medium">Nr WhatsApp</Label>
                          <div className="flex gap-2">
                            <Input
                              value={whatsappCountryCode}
                              onChange={(e) => setWhatsappCountryCode(e.target.value)}
                              placeholder="+55"
                              className="w-20"
                            />
                            <IMaskInput
                              mask="(00) 00000-0000"
                              definitions={{
                                '0': /[0-9]/
                              }}
                              value={whatsappNumber}
                              onAccept={(value: string) => setWhatsappNumber(value)}
                              placeholder="(00) 00000-0000"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondaryPhone" className="mb-2 block font-medium">Telefone Secundário</Label>
                          <div className="flex gap-2">
                            <Input
                              value={secondaryCountryCode}
                              onChange={(e) => setSecondaryCountryCode(e.target.value)}
                              placeholder="+55"
                              className="w-20"
                            />
                            <IMaskInput
                              mask="(00) 0000-0000"
                              definitions={{
                                '0': /[0-9]/
                              }}
                              value={secondaryPhone}
                              onAccept={(value: string) => setSecondaryPhone(value)}
                              placeholder="(00) 0000-0000"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Endereço */}
                    <div className="space-y-4 bg-gradient-to-r from-purple-50 to-transparent p-6 rounded-lg border border-purple-100">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-700">
                        <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
                        Endereço
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="zipCode" className="mb-2 block font-medium">CEP</Label>
                          <div className="relative">
                            <IMaskInput
                              mask="00000-000"
                              definitions={{
                                '0': /[0-9]/
                              }}
                              value={zipCode}
                              onAccept={(value: string) => handleCepChange(value)}
                              placeholder="00000-000"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            {loadingCep && (
                              <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Preenche endereço automaticamente</p>
                        </div>
                        <div>
                          <Label htmlFor="city" className="mb-2 block font-medium">Cidade</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="mb-2 block font-medium">UF</Label>
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
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="street" className="mb-2 block font-medium">Logradouro</Label>
                          <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressNumber" className="mb-2 block font-medium">Número</Label>
                          <Input
                            id="addressNumber"
                            value={addressNumber}
                            onChange={(e) => setAddressNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="neighborhood" className="mb-2 block font-medium">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="complement" className="mb-2 block font-medium">Complemento</Label>
                          <Input
                            id="complement"
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                            placeholder="Apto, Bloco, etc."
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Dados Bancários */}
                    <div className="space-y-4 bg-gradient-to-r from-amber-50 to-transparent p-6 rounded-lg border border-amber-100">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-700">
                        <div className="h-8 w-1 bg-amber-600 rounded-full"></div>
                        Dados Bancários
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="bankCode" className="mb-2 block font-medium">Código do Banco</Label>
                          <Input
                            id="bankCode"
                            value={bankCode}
                            onChange={(e) => {
                              const codigo = e.target.value;
                              setBankCode(codigo);
                              const banco = BANCOS_BRASIL.find(b => b.codigo === codigo);
                              if (banco) {
                                setBankName(banco.nome);
                              }
                            }}
                            placeholder="000"
                            maxLength={3}
                            list="bancos-list"
                          />
                          <datalist id="bancos-list">
                            {BANCOS_BRASIL.map(banco => (
                              <option key={banco.codigo} value={banco.codigo}>
                                {banco.codigo} - {banco.nome}
                              </option>
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <Label htmlFor="bankName" className="mb-2 block font-medium">Nome do Banco</Label>
                          <Input
                            id="bankName"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Preenchido automaticamente"
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="accountType" className="mb-2 block font-medium">Tipo de Conta</Label>
                          <Select value={accountType} onValueChange={(v) => setAccountType(v as "salario" | "corrente" | "poupanca")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salario">Salário</SelectItem>
                              <SelectItem value="corrente">Corrente</SelectItem>
                              <SelectItem value="poupanca">Poupança</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="agency" className="mb-2 block font-medium">Agência</Label>
                          <Input
                            id="agency"
                            value={agency}
                            onChange={(e) => setAgency(e.target.value)}
                            placeholder="0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber" className="mb-2 block font-medium">Conta</Label>
                          <Input
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="00000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="accountDigit" className="mb-2 block font-medium">Dígito</Label>
                          <Input
                            id="accountDigit"
                            value={accountDigit}
                            onChange={(e) => setAccountDigit(e.target.value)}
                            placeholder="0"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pixKey" className="mb-2 block font-medium">Chave PIX</Label>
                          <Input
                            id="pixKey"
                            value={pixKey}
                            onChange={(e) => setPixKey(e.target.value)}
                            placeholder="Preenchido automaticamente com CPF"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Preenchido automaticamente com o CPF</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => {
                        setOpenCreate(false);
                        resetForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || !isFormValid()}
                        className="min-w-[150px]"
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Criar Cooperado
                          </>
                        )}
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
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="mb-2 block">Buscar por Nome ou CPF</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Digite para buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="statusFilter" className="mb-2 block">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="desligado">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contractFilter" className="mb-2 block">Contrato</Label>
                  <Select value={contractFilter} onValueChange={setContractFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="sem_contrato">Sem contrato</SelectItem>
                      {contracts?.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          {contract.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(searchTerm || statusFilter !== "todos" || contractFilter !== "todos") && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {sortedCooperados?.length || 0} de {cooperados?.length || 0} cooperados
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("todos");
                      setContractFilter("todos");
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tabela */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                      <div className="flex items-center">
                        ID
                        <SortIcon column="id" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("registrationNumber")}>
                      <div className="flex items-center">
                        Matrícula
                        <SortIcon column="registrationNumber" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Nome
                        <SortIcon column="name" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("document")}>
                      <div className="flex items-center">
                        CPF
                        <SortIcon column="document" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("position")}>
                      <div className="flex items-center">
                        Cargo
                        <SortIcon column="position" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      <div className="flex items-center">
                        Status
                        <SortIcon column="status" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("contractId")}>
                      <div className="flex items-center">
                        Contrato
                        <SortIcon column="contractId" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCooperados && sortedCooperados.length > 0 ? (
                    sortedCooperados.map((cooperado: Cooperado) => (
                      <TableRow key={cooperado.id}>
                        <TableCell className="font-medium">{cooperado.id}</TableCell>
                        <TableCell>{cooperado.registrationNumber}</TableCell>
                        <TableCell>{cooperado.name}</TableCell>
                        <TableCell>{formatCPF(cooperado.document)}</TableCell>
                        <TableCell>{cooperado.position || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={
                            cooperado.status === "ativo" ? "default" : 
                            cooperado.status === "inativo" ? "secondary" : 
                            "destructive"
                          }>
                            {cooperado.status === "ativo" ? "ATIVO" : 
                             cooperado.status === "inativo" ? "INATIVO" : 
                             "DESLIGADO"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cooperado.contractId 
                            ? contracts?.find(c => c.id === cooperado.contractId)?.name 
                            : "SEM CONTRATO"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCooperadoId(cooperado.id);
                                setOpenBankData(true);
                              }}
                              title="Ver Dados Bancários"
                            >
                              <CreditCard className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(cooperado)}
                              title="Editar Cooperado"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(cooperado)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum cooperado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog de Edição */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="w-[95vw] max-w-[1600px] max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>Editar Cooperado</DialogTitle>
            <DialogDescription>Atualize os dados do cooperado</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editRegistrationNumber">Matrícula</Label>
                <Input
                  id="editRegistrationNumber"
                  type="number"
                  value={editRegistrationNumber}
                  onChange={(e) => setEditRegistrationNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editDocument">CPF</Label>
                <Input
                  id="editDocument"
                  value={editDocument}
                  onChange={(e) => setEditDocument(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editName">Nome Completo</Label>
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
                <Label htmlFor="editTerminationDate">Data de Desligamento</Label>
                <Input
                  id="editTerminationDate"
                  type="date"
                  value={editTerminationDate}
                  onChange={(e) => setEditTerminationDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPosition">Cargo</Label>
                <Input
                  id="editPosition"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as "ativo" | "inativo" | "desligado")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editContractId">Contrato</Label>
                <Select value={editContractId} onValueChange={setEditContractId}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editWhatsappNumber">WhatsApp</Label>
                <Input
                  id="editWhatsappNumber"
                  value={editWhatsappNumber}
                  onChange={(e) => setEditWhatsappNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editSecondaryPhone">Telefone Secundário</Label>
                <Input
                  id="editSecondaryPhone"
                  value={editSecondaryPhone}
                  onChange={(e) => setEditSecondaryPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="editStreet">Logradouro</Label>
                <Input
                  id="editStreet"
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editAddressNumber">Número</Label>
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
                />
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
      
      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-2">
                  Tem certeza que deseja excluir permanentemente o cooperado <strong>{deletingCooperado?.name}</strong>?
                </p>
                <p className="mb-2 text-red-600 font-semibold">
                  ⚠️ Esta ação não pode ser desfeita!
                </p>
                <p>
                  Todos os dados do cooperado serão removidos do sistema.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal de Dados Bancários */}
      <Dialog open={openBankData} onOpenChange={setOpenBankData}>
        <DialogContent className="w-[95vw] max-w-[600px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Dados Bancários</DialogTitle>
            <DialogDescription>
              Informações bancárias do cooperado
            </DialogDescription>
          </DialogHeader>
          
          {isBankDataLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : bankData ? (
            <div className="space-y-6 mt-6">
              {/* Informações do Banco */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Informações Bancárias
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Código do Banco</Label>
                    <p className="text-base font-medium mt-1">{bankData.bankCode || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Nome do Banco</Label>
                    <p className="text-base font-medium mt-1">{bankData.bankName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tipo de Conta</Label>
                    <p className="text-base font-medium mt-1">
                      {bankData.accountType === "corrente" && "Conta Corrente"}
                      {bankData.accountType === "poupanca" && "Conta Poupança"}
                      {bankData.accountType === "salario" && "Conta Salário"}
                      {!bankData.accountType && "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Agência</Label>
                    <p className="text-base font-medium mt-1">{bankData.agency || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Conta</Label>
                    <p className="text-base font-medium mt-1">{bankData.accountNumber || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Dígito</Label>
                    <p className="text-base font-medium mt-1">{bankData.accountDigit || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Chave PIX</Label>
                    <p className="text-base font-medium mt-1 break-all">{bankData.pixKey || "-"}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setOpenBankData(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum dado bancário cadastrado para este cooperado.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}
