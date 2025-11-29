import { ToastActionElement as ToastActionElementPrimitive } from '@radix-ui/react-toast';
import * as React from 'react';

// Define o elemento de ação para o Toast
export type ToastActionElement = React.ReactElement<typeof ToastActionElementPrimitive>;

export type ToastVariants = {
  variant?: 'default' | 'destructive' | 'success'; // Adiciona 'success'
};

export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
} & ToastVariants;

export type Toast = Omit<ToasterToast, 'id'>;

export type ToastProps = {
  className?: string;
  variant?: ToastVariants['variant'];
  action?: ToastActionElement;
  description?: React.ReactNode;
  title?: React.ReactNode;
  duration?: number;
};