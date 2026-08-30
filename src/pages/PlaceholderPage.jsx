import React from 'react';
import { Sparkles } from 'lucide-react';

export function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-8 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-teal-500 animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          {title}
        </h1>
        
        <p className="text-lg text-slate-500 leading-relaxed font-medium">
          Modul ini terintegrasi langsung dengan core SIMRS. Tersedia pada fase perilisan Q4.
        </p>

        <div className="mt-10">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2.5 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Work in Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
