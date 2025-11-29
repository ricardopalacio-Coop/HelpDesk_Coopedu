import {
  Toast, // Importa o componente JSX de toast.tsx
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from './toast'; // Componente visual
import { useToast } from './use-toast'; // Importa o hook de estado
import { CheckCircle2, XCircle } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        let IconComponent = null;
        let className = '';

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
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}