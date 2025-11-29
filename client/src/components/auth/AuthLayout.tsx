import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

function AuthLayout({ children, title, subtitle }: AuthLayoutProps) { // <-- REMOVIDO 'export' AQUI
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* LADO ESQUERDO - Formulário (Largura Aumentada) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 animate-in slide-in-from-left-5 duration-500 fade-in">
        <div className="w-full max-w-md space-y-8"> 
          
          {/* LOGO: Posição no topo do contêiner */}
          <div className="text-center lg:text-left">
            <div className="mb-8"> 
              <img 
                src="/logo-coopedu.png" 
                alt="Logo Coopedu"
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>
          {/* FIM LOGO */}

          
          {/* Cabeçalho do Formulário (Ajuste de Spacing) */}
          <div className="text-center lg:text-left space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Onde o formulário de Login/Register vai entrar */}
          {children}

          <p className="px-8 text-center text-xs text-muted-foreground pt-4">
            © 2025 Coopedu - Excelência em Educação
          </p>
        </div>
      </div>

      {/* LADO DIREITO - Visual Estilo Manus com Animação */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0c2856] text-white overflow-hidden items-center justify-center">
        
        {/* Imagem de Fundo (Com animação) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1542810634-71ab61922c26?q=80&fm=jpg&w=1920&fit=crop")',
            filter: 'grayscale(100%)'
          }} 
        />

        {/* Gradiente Azul por cima */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0c2856] via-[#0c2856]/80 to-transparent" />

        {/* Conteúdo Flutuante (Frase Corrigida) */}
        <div className="relative z-20 flex flex-col items-center text-center p-12 max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-2xl font-medium leading-relaxed italic text-white/90">
              "A tecnologia conecta, mas é o cooperativismo que transforma realidades."
            </p>
            <footer className="text-lg font-semibold text-white/90 uppercase tracking-wider pt-2">
              SISTEMA HELP DESK DE COOPERATIVAS
            </footer>
          </blockquote>
        </div>

        {/* Efeitos de Luz */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>
    </div>
  );
}

export default AuthLayout; // <-- ADICIONADO: Exportação Padrão