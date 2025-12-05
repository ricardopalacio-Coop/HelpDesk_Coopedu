// client/src/App.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logoCoopedu from "@/assets/logo-coopedu.png";
import callCenterBg from "@/assets/call-center-bg.jpg";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const Auth = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setLocation("/home"); // Corrigido: redireciona para /home
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLocation("/home"); // Corrigido: redireciona para /home
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const switchMode = (newMode: "login" | "register" | "forgot") => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email enviado!",
            description: "Verifique sua caixa de entrada para redefinir a senha.",
          });
          switchMode("login");
        }
        setLoading(false);
        return;
      }

      if (mode === "register" && password !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const validatedData = loginSchema.parse({ email, password });

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Erro ao entrar",
              description: "Email ou senha incorretos",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro ao entrar",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Sucesso!",
            description: "Login realizado com sucesso",
          });
        }
      } else {
        const redirectUrl = `${window.location.origin}/home`;
        const { error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Erro ao cadastrar",
              description: "Este email já está cadastrado. Tente fazer login.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro ao cadastrar",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Sucesso!",
            description: "Verifique seu email para confirmar o cadastro",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "register": return "Criar Conta";
      case "forgot": return "Recuperar Senha";
      default: return "Bem-vindo de volta";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "register": return "Preencha os dados para se cadastrar.";
      case "forgot": return "Digite seu email para recuperar a senha.";
      default: return "Acesse sua conta Coopedu.";
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${callCenterBg})` }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Login Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src={logoCoopedu} 
              alt="Coopedu Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Title */}
          <div className="mb-2 text-center">
            <p className="text-sm font-medium text-[#1e3a5f]">Help Desk Cooperativas</p>
          </div>

          <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
            {getTitle()}
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            {getSubtitle()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-300 bg-gray-50 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== "forgot" && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-sm text-[#1e3a5f] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-300 bg-gray-50 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 border-gray-300 bg-gray-50 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#1e3a5f] text-white hover:bg-[#152a45] flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                "Carregando..."
              ) : (
                <>
                  {mode === "login" && "Entrar"}
                  {mode === "register" && "Cadastrar"}
                  {mode === "forgot" && "Enviar Email"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Mode Switch Links */}
          <div className="mt-6 text-center text-sm">
            {mode === "login" && (
              <p className="text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-medium text-[#1e3a5f] hover:underline"
                >
                  Registre-se
                </button>
              </p>
            )}
            {mode === "register" && (
              <p className="text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-medium text-[#1e3a5f] hover:underline"
                >
                  Entrar
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-medium text-[#1e3a5f] hover:underline"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/80">
          © 2025 Coopedu - Excelência em Educação
        </p>
      </div>
    </div>
  );
};

export default Auth;
