import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import Papa from "papaparse";
import { toast } from "sonner";

export default function Configuracoes() {
  const [cooperadosFile, setCooperadosFile] = useState<File | null>(null);
  const [contractsFile, setContractsFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  
  const cooperadosInputRef = useRef<HTMLInputElement>(null);
  const contractsInputRef = useRef<HTMLInputElement>(null);

  const importCooperadosMutation = trpc.import.importCooperados.useMutation({
    onSuccess: (data) => {
      setImportResult({ type: "cooperados", ...data });
      toast.success(`${data.success} cooperados importados com sucesso!`);
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} erros encontrados. Verifique o relatório.`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao importar cooperados: ${error.message}`);
    },
  });

  const importContractsMutation = trpc.import.importContracts.useMutation({
    onSuccess: (data) => {
      setImportResult({ type: "contracts", ...data });
      toast.success(`${data.success} contratos importados com sucesso!`);
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} erros encontrados. Verifique o relatório.`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao importar contratos: ${error.message}`);
    },
  });

  const handleCooperadosImport = () => {
    if (!cooperadosFile) {
      toast.error("Selecione um arquivo CSV");
      return;
    }

    Papa.parse(cooperadosFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          registrationNumber: row.matricula || row.registrationNumber,
          name: row.nome || row.name,
          document: row.documento || row.document || row.cpf,
          email: row.email || undefined,
          phone: row.telefone || row.phone || undefined,
          birthDate: row.dataNascimento || row.birthDate || undefined,
          admissionDate: row.dataAdmissao || row.admissionDate || undefined,
          position: row.cargo || row.position || undefined,
          status: row.status || "ativo",
          contractId: row.contratoId || row.contractId ? Number(row.contratoId || row.contractId) : undefined,
        }));

        importCooperadosMutation.mutate({ data });
      },
      error: (error) => {
        toast.error(`Erro ao ler arquivo: ${error.message}`);
      },
    });
  };

  const handleContractsImport = () => {
    if (!contractsFile) {
      toast.error("Selecione um arquivo CSV");
      return;
    }

    Papa.parse(contractsFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          name: row.nome || row.name,
          status: row.status || "ativo",
          validityDate: row.dataValidade || row.validityDate || undefined,
        }));

        importContractsMutation.mutate({ data });
      },
      error: (error) => {
        toast.error(`Erro ao ler arquivo: ${error.message}`);
      },
    });
  };

  const downloadCooperadosTemplate = () => {
    const csv = `matricula,nome,documento,email,telefone,dataNascimento,dataAdmissao,cargo,status,contratoId
12345,João da Silva,123.456.789-00,joao@email.com,11999999999,1990-01-15,2020-03-01,Analista,ativo,1
67890,Maria Santos,987.654.321-00,maria@email.com,11988888888,1985-05-20,2019-06-15,Gerente,ativo,1`;
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modelo_cooperados.csv";
    link.click();
  };

  const downloadContractsTemplate = () => {
    const csv = `nome,status,dataValidade
Contrato Padrão,ativo,2025-12-31
Contrato Temporário,ativo,2024-06-30`;
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modelo_contratos.csv";
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Importação em massa de dados via CSV</p>
        </div>

        {/* Importar Cooperados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Importar Cooperados
            </CardTitle>
            <CardDescription>
              Faça upload de um arquivo CSV para importar cooperados em massa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="cooperados-file">Arquivo CSV</Label>
                <Input
                  id="cooperados-file"
                  ref={cooperadosInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCooperadosFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={handleCooperadosImport}
                disabled={!cooperadosFile || importCooperadosMutation.isPending}
              >
                {importCooperadosMutation.isPending ? (
                  <>Importando...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadCooperadosTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Modelo
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Formato do CSV</AlertTitle>
              <AlertDescription>
                O arquivo deve conter as colunas: <strong>matricula, nome, documento, email, telefone, 
                dataNascimento, dataAdmissao, cargo, status, contratoId</strong>. 
                Campos obrigatórios: matricula, nome, documento.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Importar Contratos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Importar Contratos
            </CardTitle>
            <CardDescription>
              Faça upload de um arquivo CSV para importar contratos em massa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="contracts-file">Arquivo CSV</Label>
                <Input
                  id="contracts-file"
                  ref={contractsInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setContractsFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={handleContractsImport}
                disabled={!contractsFile || importContractsMutation.isPending}
              >
                {importContractsMutation.isPending ? (
                  <>Importando...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadContractsTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Modelo
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Formato do CSV</AlertTitle>
              <AlertDescription>
                O arquivo deve conter as colunas: <strong>nome, status, dataValidade</strong>. 
                Campo obrigatório: nome.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Relatório de Importação */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Relatório de Importação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Registros Importados</p>
                  <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Erros Encontrados</p>
                  <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Detalhes dos Erros:</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {importResult.errors.map((error: any, index: number) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Linha {error.row}</AlertTitle>
                        <AlertDescription>{error.error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
