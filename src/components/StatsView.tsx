import React from 'react';
import { Award, Trophy, TrendingUp, BookOpen, Star } from 'lucide-react';
import type { BookRecord, CubeRecord } from '../types';

interface StatsViewProps {
  stats: {
    sticker: number;
    best: number | null;
    allCube: (CubeRecord & { date: string })[];
    allBooks: (BookRecord & { date:string })[];
  };
}

const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom pb-10 text-center">
      <h2 className="text-3xl font-black text-indigo-900 px-2 tracking-tighter flex items-center justify-center gap-2 uppercase">Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
        <div className="bg-indigo-600 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
          <Award size={140} className="absolute -right-10 -bottom-10 opacity-20 rotate-12" />
          <h3 className="text-7xl font-black">{stats.sticker}</h3>
          <p className="font-bold mt-2 uppercase text-xs">Mission Clear</p>
        </div>
        <div className="bg-purple-600 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
          <Trophy size={140} className="absolute -right-10 -bottom-10 opacity-20" />
          <h3 className="text-7xl font-black">{stats.best ? Number(stats.best).toFixed(2) : '-'}<span className="text-xl ml-2">초</span></h3>
          <p className="font-bold mt-2 uppercase text-xs">Best Cube</p>
        </div>
      </div>
      
      <section className="bg-white rounded-[32px] shadow-lg border border-slate-200 overflow-hidden">
         <div className="p-6 bg-slate-50 border-b border-slate-100 font-black text-xl flex items-center gap-2"><TrendingUp className="text-indigo-500"/> 큐브 성장 곡선</div>
         <div className="p-8 h-64 flex items-end gap-2 bg-slate-50/20 overflow-x-auto">
           {stats.allCube.length > 0 ? stats.allCube.slice().reverse().map((r, i) => (
             <div key={i} className="flex-1 min-w-[45px] bg-indigo-500 rounded-t-2xl transition-all relative group shadow-sm" style={{ height: `${(Number(r.time) / Math.max(...stats.allCube.map(m => Number(m.time)))) * 100}%` }}>
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl pointer-events-none">{String(r.time)}초 ({String(r.date).slice(5)})</div>
             </div>
           )) : <div className="w-full text-center text-slate-300 py-24 font-bold italic">기록을 입력하면 그래프가 나타나요!</div>}
         </div>
      </section>

      <section className="bg-white rounded-[32px] shadow-lg border border-slate-200 overflow-hidden p-6">
        <h3 className="font-black text-xl flex items-center gap-2 mb-4"><BookOpen className="text-orange-500" /> 나의 겨울 도서관</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {stats.allBooks.length > 0 ? stats.allBooks.slice().reverse().map((b, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-white shadow-sm hover:bg-slate-100 transition-colors">
              <div className="flex flex-col text-left"><span className="text-[10px] font-black text-slate-400 mb-1">{b.date}</span><span className="font-black text-slate-800 text-lg">{b.title}</span></div>
              <div className="flex text-orange-400 gap-0.5">{[...Array(b.stars)].map((_,i)=><Star key={i} size={14} fill="currentColor"/>)}</div>
            </div>
          )) : <p className="text-center py-20 text-slate-300 font-bold italic">아직 읽은 책이 없어요.</p>}
        </div>
      </section>
    </div>
  );
};

export default StatsView;
