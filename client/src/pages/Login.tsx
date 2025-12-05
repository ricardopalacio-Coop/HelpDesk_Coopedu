import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import callCenterBg from "@/assets/call-center-bg.jpg";
import logoCoopedu from "@/assets/logo-coopedu.png";
import bordas from "@/assets/bordas.png";

type AuthMode = "login" | "register" | "forgot";

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "login") {
        // TODO: Integrar com Supabase Auth - signInWithPassword
        console.log("Login:", { email, password });
      } else if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem");
        }
        // TODO: Integrar com Supabase Auth - signUp
        console.log("Register:", { email, password });
        setSuccess("Conta criada! Verifique seu e-mail para confirmar.");
      } else if (mode === "forgot") {
        // TODO: Integrar com Supabase Auth - resetPasswordForEmail
        console.log("Forgot password:", { email });
        setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${callCenterBg})` }}
      />

      {/* Left Border */}
      <div className="absolute top-0 left-0 h-full pointer-events-none">
        <img
          src={bordas}
          alt=""
          className="h-full w-auto object-cover mix-blend-darken"
        />
      </div>

      {/* Right Border */}
      <div className="absolute top-0 right-0 h-full pointer-events-none">
        <img
          src={bordas}
          alt=""
          className="h-full w-auto object-cover mix-blend-darken scale-x-[-1]"
        />
      </div>

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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
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
