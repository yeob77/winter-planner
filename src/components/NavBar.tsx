import React from 'react';
import { LayoutGrid, ListChecks, Plus, PenLine, BarChart3 } from 'lucide-react';
import type { View } from '../types';

interface NavBarProps {
  view: View;
  setView: (view: View) => void;
}

const NavBar: React.FC<NavBarProps> = ({ view, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-4 flex justify-around items-center z-50 shadow-2xl">
      <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'calendar' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <LayoutGrid size={24} />
        <span className="text-[9px] font-black uppercase tracking-tighter">달력</span>
      </button>
      <button onClick={() => setView('day')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'day' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <ListChecks size={24} />
        <span className="text-[9px] font-black uppercase tracking-tighter">할 일</span>
      </button>
      <button onClick={() => setView('record')} className={`flex flex-col items-center gap-1 w-20 h-20 -mt-10 bg-white rounded-full border-4 border-slate-50 shadow-2xl transition-all ${view === 'record' ? 'text-indigo-600 scale-110' : 'text-slate-500'}`}>
        <div className={`mt-3 p-3 rounded-full ${view === 'record' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-slate-100'}`}>
          <Plus size={28} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black mt-1 uppercase">기록</span>
      </button>
      <button onClick={() => setView('diary')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'diary' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <PenLine size={24} />
        <span className="text-[9px] font-black uppercase tracking-tighter">일기</span>
      </button>
      <button onClick={() => setView('stats')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
        <BarChart3 size={24} />
        <span className="text-[9px] font-black uppercase tracking-tighter">리포트</span>
      </button>
    </nav>
  );
};

export default NavBar;
