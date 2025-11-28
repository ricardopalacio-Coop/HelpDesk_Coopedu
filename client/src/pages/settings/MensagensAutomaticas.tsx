import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MensagensAutomaticas() {
  const [quickMessageTitle, setQuickMessageTitle] = useState("");
  const [quickMessageContent, setQuickMessageContent] = useState("");
  const [quickMessageCategory, setQuickMessageCategory] = useState("");
  
  const { data: quickMessages, refetch: refetchQuickMessages } = trpc.quickMessages.list.useQuery();
  
  const createQuickMessageMutation = trpc.quickMessages.create.useMutation({
    onSuccess: () => {
      toast.success("Mensagem rápida criada com sucesso!");
      setQuickMessageTitle("");
      setQuickMessageContent("");
      setQuickMessageCategory("");
      refetchQuickMessages();
    },
    onError: (error) => {
      toast.error(`Erro ao criar mensagem: ${error.message}`);
    },
  });
  
  const deleteQuickMessageMutation = trpc.quickMessages.delete.useMutation({
    onSuccess: () => {
      toast.success("Mensagem rápida excluída!");
      refetchQuickMessages();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir mensagem: ${error.message}`);
    },
  });
  
  const handleCreateQuickMessage = () => {
    if (!quickMessageTitle || !quickMessageContent) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }
    
    createQuickMessageMutation.mutate({
      title: quickMessageTitle,
      content: quickMessageContent,
      category: quickMessageCategory || undefined,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensagens Automáticas</h1>
          <p className="text-muted-foreground">Gerencie mensagens pré-definidas para uso rápido no WhatsApp</p>
        </div>

        {/* Mensagens Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagens Rápidas
            </CardTitle>
            <CardDescription>
              Crie mensagens pré-definidas para uso rápido no WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário de Nova Mensagem */}
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid gap-2">
                <Label htmlFor="quick-message-title">Título</Label>
                <Input
                  id="quick-message-title"
                  placeholder="Ex: Saudação Inicial"
                  value={quickMessageTitle}
                  onChange={(e) => setQuickMessageTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quick-message-content">Mensagem</Label>
                <textarea
                  id="quick-message-content"
                  placeholder="Digite a mensagem..."
                  value={quickMessageContent}
                  onChange={(e) => setQuickMessageContent(e.target.value)}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quick-message-category">Categoria (opcional)</Label>
                <Input
                  id="quick-message-category"
                  placeholder="Ex: Atendimento, Financeiro"
                  value={quickMessageCategory}
                  onChange={(e) => setQuickMessageCategory(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateQuickMessage}
                disabled={createQuickMessageMutation.isPending}
                className="w-full"
              >
                {createQuickMessageMutation.isPending ? (
                  <>Criando...</>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Mensagem
                  </>
                )}
              </Button>
            </div>

            {/* Lista de Mensagens */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Mensagens Cadastradas</h4>
              {quickMessages && quickMessages.length > 0 ? (
                <div className="space-y-2">
                  {quickMessages.map((msg: any) => (
                    <div key={msg.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{msg.title}</h5>
                          {msg.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {msg.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuickMessageMutation.mutate({ id: msg.id })}
                        disabled={deleteQuickMessageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma mensagem rápida cadastrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
