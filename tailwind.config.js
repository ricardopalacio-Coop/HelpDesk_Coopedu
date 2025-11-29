/** @type {import('tailwindcss').Config} */
module.exports = {
  // Onde o Tailwind deve procurar por classes de utilidade.
  // CRUCIAL: Apontamos para a pasta client/src (onde estão todos os seus .tsx)
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}", 
    "./client/components/**/*.{js,ts,jsx,tsx}",
    "./client/pages/**/*.{js,ts,jsx,tsx}",
  ],
  
  darkMode: ["class"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Mapeamos as cores base que foram definidas no seu index.css
        // Usamos a sintaxe 'var(--nome-da-variavel)'
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        // Adicionamos as cores customizadas da Sidebar e dos Status
        "sidebar-primary": "hsl(var(--sidebar-primary))",
        "status-aberto": "hsl(var(--status-aberto))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // O seu projeto usa a biblioteca 'tailwindcss-animate'
  plugins: [require("tailwindcss-animate")], 
};