import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

interface ValidationProps {
  email: string | null;
  status: 'PENDING' | 'LOGIN_PENDING' | 'SUCCESS';
}

// Este é um placeholder, será o novo componente
function ValidationStatus({ email, status }: ValidationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  
  // Detalhes da tela (Microcopy rigoroso)
  const isSuccess = status === 'SUCCESS';
  const isPending = status === 'PENDING' || status === 'LOGIN_PENDING';
  
  const title = isSuccess ? "Validação concluída!" : "Validação pendente";
  const subtitle = isSuccess 
    ? "Sua conta foi ativada com sucesso. Clique abaixo para acessar."
    : "Enviamos um e-mail de ativação para o seu endereço. Verifique sua caixa de entrada.";

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      // Supabase envia o link de validação novamente
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      toast({
        title: "E-mail reenviado!",
        description: "Verifique sua caixa de entrada ou spam.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro ao reenviar",
        description: "Não foi possível reenviar agora. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout 
      title={title} 
      subtitle={subtitle}
    >
      <div className="space-y-6 text-center">
        <Mail className="h-16 w-16 mx-auto text-[#005487]" />
        
        <p className="text-sm text-gray-700">
          Por favor, acesse o e-mail enviado para **{email}** e clique no link de ativação.
        </p>

        {isPending && (
          <div className="space-y-3">
            <Button 
              className="btn-primary-auth bg-[#005487] h-11" // Cor secundária para destaque
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reenviar e-mail de validação"}
            </Button>

            <p className="text-xs text-muted-foreground pt-1">
              Caso não encontre, verifique também a pasta de spam/lixo eletrônico.
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={() => setLocation('/auth/login')}
          className="w-full h-11 mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Login
        </Button>
      </div>

    </AuthLayout>
  );
}

export default ValidationStatus;