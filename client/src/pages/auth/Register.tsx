import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc"; // Adicionar importação do tRPC
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

// 1. Esquema de Validação (Regras)
const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const userMutation = trpc.users.createUser.useMutation(); // Hook tRPC

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  // 2. Ação de Cadastro
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      // 1. Cria usuário no Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.name }
        }
      });

      if (error) throw error;
      
      // NOVO PASSO CRÍTICO: Sincronização com o MySQL via tRPC
      if (authData.user) {
        await userMutation.mutateAsync({
          openId: authData.user.id, // O ID único do Supabase (UUID)
          email: authData.user.email || data.email,
          name: data.name,
          role: 'user', // Defina o role inicial
        });
      }

      // 2. Notificação e Redirecionamento UX (Validação Pendente)
      toast({
        title: "Conta criada!",
        description: "Você será redirecionado para a validação.",
        variant: "success"
      });

      // Redireciona para a tela de status de validação, passando o email
      setTimeout(() => setLocation(`/auth/status?email=${encodeURIComponent(data.email)}&status=PENDING`), 1500);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha ao criar conta",
        description: error.message || "Erro desconhecido durante o cadastro."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout 
      title="Crie sua conta" 
      subtitle="Junte-se à Coopedu e gerencie seus atendimentos."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Nome Completo */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Seu nome" className="pl-10 h-11" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* E-mail */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="seu@email.com" className="pl-10 h-11" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Senha e Confirmar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="******" className="pl-10 h-11" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="******" className="pl-10 h-11" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="btn-primary-auth h-11" disabled={isLoading || userMutation.isPending}>
            {isLoading || userMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Criar Conta <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-2">
            Já tem uma conta? <a href="/auth/login" className="font-semibold text-[#005487] hover:underline">Fazer login</a>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}