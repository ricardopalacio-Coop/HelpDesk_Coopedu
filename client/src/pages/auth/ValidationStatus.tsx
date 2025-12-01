import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

interface ValidationProps {
  email: string | null;
  status: 'PENDING' | 'LOGIN_PENDING' | 'SUCCESS';
}

function ValidationStatus({ email, status }: ValidationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  
  // Detalhes da tela
  const isSuccess = status === 'SUCCESS';
  const isPending = status === 'PENDING';
  const isLoginPending = status === 'LOGIN_PENDING';
  
  const icon = isSuccess ? CheckCircle2 : AlertTriangle;
  const iconColor = isSuccess ? "text-green-500" : "text-yellow-600";

  // Microcopy rigoroso
  const title = isSuccess 
    ? "Validação Concluída!" 
    : isLoginPending 
    ? "Validação Pendente" 
    : "Confirme seu E-mail";

  const subtitle = isSuccess 
    ? "Sua conta foi ativada com sucesso. Clique abaixo para acessar."
    : isLoginPending
    ? "Sua conta já está criada, mas o acesso exige ativação por e-mail."
    : "Enviamos um link de ativação para o seu endereço. Verifique sua caixa de entrada.";

  const message = isLoginPending 
    ? "Por favor, acesse o e-mail enviado para validar e tente entrar novamente."
    : "Abra a sua caixa de entrada, clique no link de ativação e volte para o sistema.";


  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      toast({
        title: "E-mail Reenviado!",
        description: "Verifique sua caixa de entrada ou spam.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Falha ao Enviar",
        description: "Não foi possível reenviar o link. Tente novamente mais tarde.",
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
        <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center ${iconColor}`}>
          <Mail className="h-8 w-8" />
        </div>
        
        <p className="text-sm text-gray-700 font-medium">
          {message}
        </p>

        {/* Botão de Reenvio (Apenas em estado PENDENTE) */}
        {(isPending || isLoginPending) && (
          <div className="space-y-3">
            <Button 
              className="btn-primary-auth bg-[#005487] h-11"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reenviar Link de Validação"}
            </Button>

            <p className="text-xs text-red-500 pt-1 font-medium">
              Caso não encontre, verifique também a pasta de spam/lixo eletrônico.
            </p>
          </div>
        )}
        
        {/* Botão Principal para Acesso */}
        <Button 
          variant={isSuccess ? "default" : "outline"} 
          onClick={() => setLocation('/auth/login')}
          className={cn("w-full h-11 mt-4", isSuccess ? "btn-primary-auth" : "border-gray-300")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isSuccess ? "Acessar Sistema" : "Voltar para o Login"}
        </Button>

      </div>
    </AuthLayout>
  );
}

export default ValidationStatus;