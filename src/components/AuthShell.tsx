import type { ReactNode } from 'react';
import { IconMap } from '@/icons';

interface AuthShellProps {
  title: string;
  eyebrow: string;
  children: ReactNode;
}

export default function AuthShell({
  title,
  eyebrow,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-blue w-16 h-16 border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <IconMap.Brain size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
              NeuroSync
            </h1>
          </div>

          <div className="bg-brand-orange border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-black uppercase text-orange-950 mb-2">
              {eyebrow}
            </p>
            <h2 className="text-5xl font-black text-white uppercase leading-none">
              {title}
            </h2>
            <div className="mt-8 bg-white border-4 border-black rounded-2xl p-5">
              <p className="text-lg font-black italic leading-snug">
                Salve seus scores, acompanhe sua sequencia e dispute o ranking
                neural.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 brutalist-card p-8 md:p-10">
          {children}
        </div>
      </section>
    </main>
  );
}
