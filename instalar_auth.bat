<# :
@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo      MODO FORCADO: INSTALADOR SUPABASE
echo ========================================================
echo.
echo O script esta rodando na pasta:
echo %CD%
echo.
echo As pastas detectadas aqui sao:
dir /b /ad
echo.
echo --------------------------------------------------------
echo Tentando entrar na pasta 'client' e instalar...
echo.

:: Pula verificacao e vai direto ao trabalho
cd client
call pnpm add @supabase/supabase-js react-hook-form zod @hookform/resolvers/zod lucide-react
cd ..

echo.
echo [2/4] Criando estrutura de pastas...
if not exist "client\src\components\auth" mkdir "client\src\components\auth"
if not exist "client\src\pages\auth" mkdir "client\src\pages\auth"
if not exist "client\src\contexts" mkdir "client\src\contexts"
if not exist "client\src\lib" mkdir "client\src\lib"

echo.
echo [3/4] Escrevendo os arquivos...
powershell -noprofile "iex (${%~f0} | out-string)"

echo.
echo ========================================================
echo                 CONCLUIDO!
echo ========================================================
echo Nao se esqueca de configurar o .env na pasta client!
pause
exit /b
:>

# --- INICIO DO SCRIPT POWERSHELL EMBUTIDO ---
$OutputEncoding = [System.Text.Encoding]::UTF8

# --- ARQUIVO: client/src/lib/supabase.ts ---
$codeSupabase = @"
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ ERRO CRÍTICO: Chaves do Supabase não encontradas no .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
"@

# --- ARQUIVO: client/src/contexts/AuthContext.tsx ---
$codeContext = @"
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
"@

# --- ARQUIVO: client/src/components/auth/AuthLayout.tsx ---
$codeLayout = @"
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 animate-in slide-in-from-left-5 duration-500 fade-in">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="h-10 w-10 rounded-lg bg-[#0c2856] flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0c2856]">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {children}
          <p className="px-8 text-center text-xs text-muted-foreground">
            © 2025 Coopedu - Excelência em Educação
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 relative bg-[#0c2856] text-white overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop")', filter: 'grayscale(100%)' }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0c2856] via-[#0c2856]/80 to-transparent" />
        <div className="relative z-20 flex flex-col items-center text-center p-12 max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-2xl font-medium leading-relaxed italic text-white/90">"A tecnologia conecta, mas é o cooperativismo que transforma realidades."</p>
            <footer className="text-sm font-medium text-white/60 uppercase tracking-widest">Sistema Integrado de Gestão</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
"@

# --- ARQUIVO: client/src/pages/auth/Login.tsx ---
$codeLogin = @"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) throw error;
      toast({ title: "Login realizado!", description: "Redirecionando...", className: "bg-green-600 text-white border-none" });
      setTimeout(() => setLocation("/"), 1000);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha ao entrar", description: error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Acesse sua conta Coopedu.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>E-mail Corporativo</FormLabel><FormControl><div className="relative"><Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="nome@coopedu.com.br" className="pl-10 h-11" {...field} /></div></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><div className="flex items-center justify-between"><FormLabel>Senha</FormLabel><a href="#" className="text-xs font-medium text-[#005487] hover:underline">Esqueceu a senha?</a></div><FormControl><div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" className="pl-10 h-11" {...field} /></div></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" className="w-full h-11 bg-[#0c2856] hover:bg-[#005487]" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Entrar <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          <div className="text-center text-sm text-muted-foreground pt-2">Não tem uma conta? <a href="/auth/register" className="font-semibold text-[#005487] hover:underline">Criar conta</a></div>
        </form>
      </Form>
    </AuthLayout>
  );
}
"@

# --- ARQUIVO: client/src/pages/auth/Register.tsx ---
$codeRegister = @"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
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

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name } }
      });
      if (error) throw error;
      toast({ title: "Conta criada!", description: "Bem-vindo ao sistema.", className: "bg-green-600 text-white border-none" });
      setTimeout(() => setLocation("/"), 1500);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao criar conta", description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Crie sua conta" subtitle="Junte-se à Coopedu.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><div className="relative"><User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Seu nome" className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>E-mail</FormLabel><FormControl><div className="relative"><Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="seu@email.com" className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Senha</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="******" className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem><FormLabel>Confirmar</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="******" className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full h-11 bg-[#0c2856] hover:bg-[#005487]" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Criar Conta <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          <div className="text-center text-sm text-muted-foreground pt-2">Já tem uma conta? <a href="/auth/login" className="font-semibold text-[#005487] hover:underline">Fazer login</a></div>
        </form>
      </Form>
    </AuthLayout>
  );
}
"@

# --- ARQUIVO: client/src/App.tsx ---
$codeApp = @"
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { trpc } from "./lib/trpc";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
  if (!user) return <Redirect to="/auth/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/">{() => <PrivateRoute component={Home} />}</Route>
      <Route><div className="flex min-h-screen items-center justify-center"><h1 className="text-2xl font-bold text-gray-800">404 - Página não encontrada</h1></div></Route>
    </Switch>
  );
}

function App() {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc", async headers() { return {}; } })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
"@

Set-Content -Path "client/src/lib/supabase.ts" -Value $codeSupabase -Encoding UTF8
Set-Content -Path "client/src/contexts/AuthContext.tsx" -Value $codeContext -Encoding UTF8
Set-Content -Path "client/src/components/auth/AuthLayout.tsx" -Value $codeLayout -Encoding UTF8
Set-Content -Path "client/src/pages/auth/Login.tsx" -Value $codeLogin -Encoding UTF8
Set-Content -Path "client/src/pages/auth/Register.tsx" -Value $codeRegister -Encoding UTF8
Set-Content -Path "client/src/App.tsx" -Value $codeApp -Encoding UTF8