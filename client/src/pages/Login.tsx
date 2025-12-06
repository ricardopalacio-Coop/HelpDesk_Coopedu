// client/src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import logoCoopedu from "@/assets/logo-coopedu.png";
import callCenterBg from "@/assets/call-center-bg.jpg";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type AuthMode = "login" | "register" | "forgot";

const Login = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 Login: Verificando sessão existente...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth State Changed:', event, session);
        if (session) {
          console.log('✅ Sessão ativa, redirecionando para /');
          setLocation("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Sessão atual:', session);
      if (session) {
        console.log('✅ Usuário já autenticado, redirecionando...');
        setLocation("/");
      }
    });

    return () => {
      console.log('🧹 Limpando subscription de auth');
      subscription.unsubscribe();
    };
  }, [setLocation]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const switchMode = (newMode: AuthMode) => {
    console.log('🔄 Mudando modo para:', newMode);
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Formulário submetido, modo:', mode);
    setLoading(true);

    try {
      // Modo: Recuperar Senha
      if (mode === "forgot") {
        console.log('📧 Enviando email de recuperação para:', email);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) {
          console.error('❌ Erro ao enviar email:', error);
          throw error;
        }
        
        console.log('✅ Email de recuperação enviado');
        toast({
          title: "Sucesso!",
          description: "E-mail de recuperação enviado! Verifique sua caixa de entrada.",
        });
        setLoading(false);
        return;
      }

      // Validação dos dados
      console.log('🔍 Validando dados...');
      const validatedData = loginSchema.parse({ email, password });
      console.log('✅ Dados validados');

      // Modo: Login
      if (mode === "login") {
        console.log('🔑 Tentando fazer login com:', validatedData.email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) {
          console.error('❌ Erro no login:', error);
          
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
          console.log('✅ Login bem-sucedido!', data);
          toast({
            title: "Sucesso!",
            description: "Login realizado com sucesso",
          });
          // O redirecionamento será feito pelo onAuthStateChange
        }
      } 
      // Modo: Registro
      else if (mode === "register") {
        if (password !== confirmPassword) {
          console.warn('⚠️ Senhas não coincidem');
          toast({
            title: "Erro",
            description: "As senhas não coincidem",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('📝 Tentando registrar usuário:', validatedData.email);
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          console.error('❌ Erro no registro:', error);
          
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
          console.log('✅ Registro bem-sucedido!', data);
          toast({
            title: "Sucesso!",
            description: "Verifique seu email para confirmar o cadastro",
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      
      if (error instanceof z.ZodError) {
        console.error('❌ Erro de validação:', error.issues);
        toast({
          title: "Erro de validação",
          description: error.issues[0]?.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      console.log('🏁 Finalizando submit');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${callCenterBg})` }}
      />

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={logoCoopedu}
              alt="Coopedu Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-[#1e3a5f] mb-6">
            Help Desk Cooperativas
          </h1>

          {mode === "login" && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Bem-vindo de volta</h2>
              <p className="text-gray-500 text-sm mb-6">Acesse sua conta Coopedu.</p>
            </>
          )}

          {mode === "register" && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Criar nova conta</h2>
              <p className="text-gray-500 text-sm mb-6">Preencha os dados abaixo.</p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Recuperar senha</h2>
              <p className="text-gray-500 text-sm mb-6">Informe seu e-mail para recuperação.</p>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  placeholder="nome@coopedu.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 border-gray-300 rounded-lg focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-sm text-[#2d8bba] hover:text-[#1e3a5f] transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 border-gray-300 rounded-lg focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Field (Register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 h-11 border-gray-300 rounded-lg focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1e3a5f] hover:bg-[#152a45] text-white font-semibold text-base rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === "login" && "Entrar"}
                  {mode === "register" && "Criar Conta"}
                  {mode === "forgot" && "Enviar E-mail"}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            {mode === "login" && (
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-[#1e3a5f] font-semibold hover:underline transition-colors"
                >
                  Criar conta
                </button>
              </p>
            )}

            {mode === "register" && (
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[#1e3a5f] font-semibold hover:underline transition-colors"
                >
                  Fazer login
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-sm text-[#1e3a5f] font-semibold hover:underline transition-colors"
              >
                Voltar para o login
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 Coopedu - Excelência em Educação
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
