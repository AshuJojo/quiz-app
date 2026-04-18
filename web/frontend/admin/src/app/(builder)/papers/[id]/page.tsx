'use client';

import { paperService } from '@/services/paper-service';
import { useQuery } from '@tanstack/react-query';
import { Eye, Rocket, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function PaperBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: paperResult, isLoading } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperService.getPaper(id),
  });

  const paper = paperResult?.data;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden animate-in fade-in duration-700">
      {/* --- TOP HEADER --- */}
      <header className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-outline-variant/10 z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/papers')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-background transition-colors group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <div className="w-[1px] h-6 bg-outline-variant/20" />
          <h1 className="text-sm font-black text-on-background tracking-tight truncate max-w-[200px]">
            {isLoading ? 'Loading...' : paper?.title || 'Untitled Paper'}
          </h1>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-all text-xs font-black uppercase tracking-widest select-none">
            <Eye size={16} />
            Preview
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all select-none">
            <Rocket size={16} strokeWidth={3} />
            Publish
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: NAVIGATOR */}
        <aside className="w-80 flex flex-col bg-surface-container-low border-r border-outline-variant/10 overflow-hidden shadow-[inset_-10px_0_30px_-15px_rgba(0,0,0,0.03)]">
          <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="flex-1" />
          </div>

          {/* Blocks Navigator (Recessed Bottom) */}
          <div className="h-48 bg-surface-container p-6 border-t border-outline-variant/10">
            <div className="flex-1" />
          </div>
        </aside>

        {/* CENTER WORKSPACE: CANVAS */}
        <main className="flex-1 bg-background relative overflow-y-auto p-12 flex items-center justify-center dot-pattern">
          {/* Workspace Canvas */}
        </main>

        {/* RIGHT SIDEBAR: PROPERTIES */}
        <aside className="w-80 flex flex-col bg-background border-l border-outline-variant/10 overflow-hidden shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.02)]">
          {/* Settings Tabs */}

          <div className="flex-1" />
        </aside>
      </div>
    </div>
  );
}
