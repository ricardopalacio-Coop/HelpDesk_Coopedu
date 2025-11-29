import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout"; // <-- CORRIGIDO: Agora importa o DEFAULT
import { Button } from "@/components/ui/button";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

// 1. Esquema de Validação
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // 2. Configuração do Formulário
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 3. Ação de Login
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      // Sucesso!
      toast({ 
        title: "Bem-vindo!", 
        description: "Login realizado com sucesso.",
        variant: "success",
      });

      // Redireciona para o Dashboard
      setTimeout(() => setLocation("/"), 1000);

    } catch (error: any) {
      console.error("Erro login:", error);
      toast({
        variant: "destructive",
        title: "Falha ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "E-mail ou senha incorretos." 
          : "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Acesse sua conta Coopedu."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Campo E-mail */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail Corporativo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="nome@coopedu.com.br" 
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-[#0c2856] focus:ring-[#0c2856]" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Senha */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <a href="/auth/forgot-password" className="text-xs font-medium text-[#005487] hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-[#0c2856] focus:ring-[#0c2856]" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botão de Entrar */}
          <Button 
            type="submit" 
            className="btn-primary-auth"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Link para Cadastro */}
          <div className="text-center text-sm text-muted-foreground pt-2">
            Não tem uma conta?{" "}
            <a href="/auth/register" className="font-semibold text-[#005487] hover:underline">
              Criar conta
            </a>
          </div>

        </form>
      </Form>
    </AuthLayout>
  );
}