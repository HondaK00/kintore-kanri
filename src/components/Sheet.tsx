import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** 画面下から出るモーダルシート */
export function Sheet({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-md">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div className="animate-slide-up absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />
        {title && <h2 className="mb-4 text-lg font-bold tracking-tight">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
