import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { QrCode, Power, PowerOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WhatsApp() {
  const { data: status, isLoading, refetch } = trpc.whatsapp.getStatus.useQuery(undefined, {
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  const initializeMutation = trpc.whatsapp.initialize.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp inicializado com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao inicializar WhatsApp: ${error.message}`);
    },
  });

  const disconnectMutation = trpc.whatsapp.disconnect.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp desconectado");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao desconectar WhatsApp: ${error.message}`);
    },
  });

  const handleInitialize = () => {
    initializeMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const getStatusInfo = () => {
    if (!status) return { icon: AlertCircle, text: "Carregando...", color: "text-gray-500" };
    
    switch (status.status) {
      case "connected":
        return { icon: CheckCircle2, text: "Conectado", color: "text-green-600" };
      case "qr_ready":
        return { icon: QrCode, text: "Aguardando QR Code", color: "text-yellow-600" };
      case "disconnected":
        return { icon: AlertCircle, text: "Desconectado", color: "text-red-600" };
      default:
        return { icon: AlertCircle, text: "Desconhecido", color: "text-gray-500" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
          <p className="text-muted-foreground">Configure a integração com WhatsApp</p>
        </div>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>Verifique o status atual da conexão WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                )}
                <div>
                  <p className="font-medium">{statusInfo.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {status?.status === "connected"
                      ? "WhatsApp conectado e pronto para enviar/receber mensagens"
                      : status?.status === "qr_ready"
                      ? "Escaneie o QR Code abaixo com seu WhatsApp"
                      : "Clique em 'Conectar' para iniciar"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {status?.status === "disconnected" && (
                  <Button
                    onClick={handleInitialize}
                    disabled={initializeMutation.isPending}
                  >
                    {initializeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Conectar
                      </>
                    )}
                  </Button>
                )}
                {(status?.status === "connected" || status?.status === "qr_ready") && (
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Desconectando...
                      </>
                    ) : (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Desconectar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        {status?.status === "qr_ready" && status.qrCode && (
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Escaneie este código com o WhatsApp do seu celular
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Alert className="mb-4">
                <QrCode className="h-4 w-4" />
                <AlertTitle>Como conectar</AlertTitle>
                <AlertDescription>
                  1. Abra o WhatsApp no seu celular<br />
                  2. Toque em Menu ou Configurações e selecione "Aparelhos conectados"<br />
                  3. Toque em "Conectar um aparelho"<br />
                  4. Aponte seu celular para esta tela para escanear o código
                </AlertDescription>
              </Alert>
              <div className="rounded-lg border-4 border-primary p-4">
                <img
                  src={status.qrCode}
                  alt="QR Code WhatsApp"
                  className="h-64 w-64"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                O QR Code é atualizado automaticamente a cada poucos segundos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre a Integração</CardTitle>
            <CardDescription>Como funciona a integração WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Recebimento de Mensagens:</strong> Quando um cooperado envia uma mensagem via WhatsApp,
              o sistema cria automaticamente um ticket vinculado ao cooperado (se cadastrado) ou como "Não Cooperado".
            </p>
            <p>
              <strong>Envio de Mensagens:</strong> Os atendentes podem responder tickets diretamente pelo sistema,
              e as mensagens são enviadas via WhatsApp para o cooperado.
            </p>
            <p>
              <strong>Pesquisa CSAT:</strong> Após o fechamento do ticket, uma pesquisa de satisfação é enviada
              automaticamente via WhatsApp para o cooperado avaliar o atendimento.
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Mantenha esta conexão ativa para garantir o funcionamento da integração.
                Se desconectar, será necessário escanear o QR Code novamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
