import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logoCoopedu from "@/assets/logo-coopedu.png";
import callCenterBg from "@/assets/call-center-bg.jpg";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const Auth = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setLocation("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLocation("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse({ email, password });

      if (isLogin) {
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
        const redirectUrl = `${window.location.origin}/`;
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${callCenterBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />

      {/* Geometric Borders */}
      <GeometricBorders />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="mb-8 flex flex-col items-center">
          <img 
            src={logoCoopedu} 
            alt="Coopedu Logo" 
            className="mb-4 h-20 w-auto drop-shadow-2xl"
          />
          <h1 className="text-center text-2xl font-bold text-white drop-shadow-lg">
            Help Desk Cooperativas
          </h1>
          <p className="mt-2 text-center text-sm text-slate-300">
            Sistema de Atendimento
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-6 text-center text-xl font-semibold text-white">
            {isLogin ? "Entrar no Sistema" : "Criar Conta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/25"
              disabled={loading}
            >
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-300 transition-colors hover:text-emerald-400"
            >
              {isLogin
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Entre"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          © 2024 Coopedu. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

// Geometric Borders Component
const GeometricBorders = () => {
  return (
    <>
      {/* Left Border */}
      <div className="absolute left-0 top-0 h-full w-32 overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 800"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="leftGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="leftGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="-0.5;1.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="white" stopOpacity="0.3">
                <animate
                  attributeName="offset"
                  values="0;2"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="white" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="0.5;2.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          {/* Main geometric shapes */}
          <polygon
            points="0,0 80,0 60,200 0,150"
            fill="url(#leftGrad1)"
            className="animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <polygon
            points="0,120 70,180 50,400 0,350"
            fill="url(#leftGrad2)"
            className="animate-pulse"
            style={{ animationDuration: "5s", animationDelay: "1s" }}
          />
          <polygon
            points="0,320 60,380 40,600 0,550"
            fill="url(#leftGrad1)"
            className="animate-pulse"
            style={{ animationDuration: "4.5s", animationDelay: "2s" }}
          />
          <polygon
            points="0,520 50,580 30,800 0,800"
            fill="url(#leftGrad2)"
            className="animate-pulse"
            style={{ animationDuration: "5.5s", animationDelay: "0.5s" }}
          />

          {/* Shine overlay */}
          <polygon points="0,0 80,0 60,200 0,150" fill="url(#shine)" />
          <polygon points="0,320 60,380 40,600 0,550" fill="url(#shine)" />
        </svg>

        {/* Floating triangles */}
        <div className="absolute left-4 top-1/4 h-4 w-4 animate-bounce opacity-60" style={{ animationDuration: "3s" }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L22 22H2L12 2Z" fill="#10b981" fillOpacity="0.6" />
          </svg>
        </div>
        <div className="absolute left-8 top-2/3 h-3 w-3 animate-bounce opacity-40" style={{ animationDuration: "4s", animationDelay: "1s" }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L22 22H2L12 2Z" fill="#14b8a6" fillOpacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Right Border */}
      <div className="absolute right-0 top-0 h-full w-32 overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 800"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rightGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="rightGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Main geometric shapes */}
          <polygon
            points="100,0 20,0 40,200 100,150"
            fill="url(#rightGrad1)"
            className="animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "0.5s" }}
          />
          <polygon
            points="100,120 30,180 50,400 100,350"
            fill="url(#rightGrad2)"
            className="animate-pulse"
            style={{ animationDuration: "5s", animationDelay: "1.5s" }}
          />
          <polygon
            points="100,320 40,380 60,600 100,550"
            fill="url(#rightGrad1)"
            className="animate-pulse"
            style={{ animationDuration: "4.5s", animationDelay: "2.5s" }}
          />
          <polygon
            points="100,520 50,580 70,800 100,800"
            fill="url(#rightGrad2)"
            className="animate-pulse"
            style={{ animationDuration: "5.5s", animationDelay: "1s" }}
          />

          {/* Shine overlay */}
          <polygon points="100,0 20,0 40,200 100,150" fill="url(#shine)" />
          <polygon points="100,320 40,380 60,600 100,550" fill="url(#shine)" />
        </svg>

        {/* Floating triangles */}
        <div className="absolute right-4 top-1/3 h-4 w-4 animate-bounce opacity-60" style={{ animationDuration: "3.5s" }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 22L2 2H22L12 22Z" fill="#0ea5e9" fillOpacity="0.6" />
          </svg>
        </div>
        <div className="absolute right-6 top-3/4 h-3 w-3 animate-bounce opacity-40" style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 22L2 2H22L12 22Z" fill="#14b8a6" fillOpacity="0.6" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default Auth;
