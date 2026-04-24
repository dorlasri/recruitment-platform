'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface ToastCtx { toast: (message: string, type?: Toast['type']) => void; }
const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let externalToast: (message: string, type?: Toast['type']) => void = () => {};
export const toast = (message: string, type: Toast['type'] = 'info') => externalToast(message, type);

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  useEffect(() => { externalToast = addToast; }, [addToast]);

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm', colors[t.type])}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="mr-auto">
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
