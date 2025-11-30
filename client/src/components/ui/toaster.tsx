import {
  Toast, 
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from './toast'; // Importa os componentes JSX do arquivo toast.tsx
import { useToast } from './use-toast'; // Importa o hook de estado
import { CheckCircle2, XCircle } from 'lucide-react';
import { ToastActionElement, ToasterToast } from './toast-types'; // Importa os tipos de dados

export function Toaster() {
  // Puxa as mensagens do hook de estado
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        let IconComponent = null;
        let className = '';

        // Define o estilo e o ícone baseado na variante (success, destructive)
        switch (variant) {
          case 'destructive':
            IconComponent = XCircle;
            className = 'group destructive'; 
            break;
          case 'success':
            IconComponent = CheckCircle2;
            className = 'group success bg-green-500 text-white'; 
            break;
          default:
            className = 'group default';
            break;
        }

        return (
          <Toast key={id} {...props} className={className}>
            <div className="flex items-center space-x-4">
                {IconComponent && <IconComponent className="h-5 w-5 shrink-0" />}
                <div className="grid gap-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && <ToastDescription>{description}</ToastDescription>}
                </div>
            </div>
            
            {/* Renderiza a Ação (Botão) se existir */}
            {action} 
            
            {/* BYPASS FINAL: Componente que estava a causar o crash - Comentado para permitir o render */}
            {/* <ToastClose /> */} 
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}