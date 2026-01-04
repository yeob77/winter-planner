import React from 'react';
import { BookOpen, Timer, Swords, Sparkles, Trash2, Clock, Star } from 'lucide-react';
import type { Settings, RecordItem } from '../types';

interface RecordViewProps {
  recordType: 'reading' | 'cube' | 'baduk';
  setRecordType: (type: 'reading' | 'cube' | 'baduk') => void;
  newBookTitle: string;
  setNewBookTitle: (title: string) => void;
  newBookStars: number;
  setNewBookStars: (stars: number) => void;
  newCubeRecord: string;
  setNewCubeRecord: (record: string) => void;
  badukDetail: any;
  setBadukDetail: (detail: any) => void;
  settings: Settings;
  isEditingHighlights: boolean;
  setIsEditingHighlights: (isEditing: boolean) => void;
  updateHighlight: (id: number, newLabel: string) => void;
  deleteHighlight: (id: number) => void;
  addHighlight: () => void;
  addRecord: (type: 'reading' | 'cube' | 'baduk', data: any) => void;
  deleteRecord: (record: RecordItem) => void;
  combinedRecords: RecordItem[];
  renderIcon: (name: string, size?: number) => React.ReactNode;
}

const RecordView: React.FC<RecordViewProps> = ({
  recordType,
  setRecordType,
  newBookTitle,
  setNewBookTitle,
  newBookStars,
  setNewBookStars,
  newCubeRecord,
  setNewCubeRecord,
  badukDetail,
  setBadukDetail,
  settings,
  isEditingHighlights,
  setIsEditingHighlights,
  updateHighlight,
  deleteHighlight,
  addHighlight,
  addRecord,
  deleteRecord,
  combinedRecords,
  renderIcon,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom pb-10">
      <h2 className="text-2xl font-black text-indigo-900 px-2 text-center uppercase tracking-widest">Growth Entry</h2>
      <div className="flex bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
        {[{ id: 'reading', label: '독서', icon: <BookOpen />, color: 'bg-orange-500' }, { id: 'cube', label: '큐브', icon: <Timer />, color: 'bg-purple-500' }, { id: 'baduk', label: '바둑', icon: <Swords />, color: 'bg-red-500' }].map(t => (
          <button key={t.id} onClick={() => setRecordType(t.id as 'reading' | 'cube' | 'baduk')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black transition-all ${recordType === t.id ? `${t.color} text-white shadow-lg` : 'text-slate-400'}`}>{t.icon} {t.label}</button>
        ))}
      </div>

      <section className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-8">
        {recordType === 'reading' && (
          <div className="space-y-6 animate-in fade-in">
            <input type="text" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} placeholder="책 제목을 입력해줘" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-700 outline-none focus:border-orange-400" />
            <div className="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <div className="flex gap-1">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setNewBookStars(s)} className={`transform transition-all ${newBookStars >= s ? 'text-orange-400 scale-125' : 'text-slate-200'}`}><Star size={32} fill={newBookStars >= s ? "currentColor" : "none"} /></button>)}</div>
              <button onClick={() => addRecord('reading', { title: newBookTitle, stars: newBookStars })} disabled={!newBookTitle.trim() || newBookStars === 0} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black shadow-lg">저장</button>
            </div>
          </div>
        )}
        {recordType === 'cube' && (
          <div className="flex gap-3 animate-in fade-in">
            <input type="number" step="0.01" value={newCubeRecord} onChange={(e) => setNewCubeRecord(e.target.value)} placeholder="초(second) 입력" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-3xl font-black text-purple-700 text-center outline-none focus:border-purple-400 shadow-inner" />
            <button onClick={() => addRecord('cube', newCubeRecord)} disabled={!newCubeRecord} className="bg-purple-600 text-white px-8 rounded-2xl font-black shadow-lg active:scale-95 transition-all">기록</button>
          </div>
        )}
        {recordType === 'baduk' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setBadukDetail({...badukDetail, type: 'success'})} className={`py-4 rounded-2xl font-black border-2 transition-all ${badukDetail.type === 'success' ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-400'}`}>도전 성공!</button>
              <button onClick={() => setBadukDetail({...badukDetail, type: 'experience'})} className={`py-4 rounded-2xl font-black border-2 transition-all ${badukDetail.type === 'experience' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-400'}`}>소중한 경험</button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><p className="font-black text-slate-400 text-xs uppercase tracking-widest">오늘의 칭찬 훈장</p><button onClick={() => setIsEditingHighlights(!isEditingHighlights)} className="text-[10px] font-black text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">수정</button></div>
              <div className="flex flex-wrap gap-2">
                {settings.badukHighlights.map(pt => (
                  <div key={pt.id}>
                    {isEditingHighlights ? (
                      <div className="flex items-center gap-1 bg-white border-2 border-indigo-100 rounded-full px-3 py-2 animate-pulse"><input value={pt.label} onChange={(e) => updateHighlight(pt.id, e.target.value)} className="bg-transparent text-sm font-black outline-none w-24" /><button onClick={() => deleteHighlight(pt.id)} className="text-red-400"><Trash2 size={14}/></button></div>
                    ) : (
                      <button onClick={() => setBadukDetail({...badukDetail, highlightId: pt.id})} className={`flex items-center gap-2 px-4 py-3 rounded-full font-black text-sm border-2 transition-all ${badukDetail.highlightId === pt.id ? 'bg-red-500 text-white border-red-500 shadow-md scale-105' : 'bg-slate-50 text-slate-400'}`}>{renderIcon(pt.icon, 14)} {pt.label}</button>
                    )}
                  </div>
                ))}
                {isEditingHighlights && <button onClick={addHighlight} className="px-4 py-2 border-2 border-dashed border-indigo-200 rounded-full text-indigo-300 font-black text-sm">+ 추가</button>}
              </div>
            </div>
            <button onClick={() => addRecord('baduk', badukDetail)} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"><Sparkles /> 성장 카드 발행</button>
          </div>
        )}
      </section>

      <section className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6 space-y-4 max-h-[450px] overflow-y-auto">
         <h3 className="font-black text-slate-700 flex items-center justify-between">오늘의 성장 흔적 <Clock size={16} className="text-slate-400" /></h3>
         {combinedRecords.map((rec) => (
           <div key={rec.timestamp} className={`p-5 rounded-3xl border shadow-sm transition-all ${rec.itemType === 'baduk' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-white'}`}>
             <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-black text-slate-300 bg-white px-2 py-1 rounded-lg border border-slate-100">{rec.timestamp}</span>
               <button onClick={() => deleteRecord(rec)} className="text-slate-300 hover:text-red-400"><Trash2 size={14}/></button>
             </div>
             {rec.itemType === 'book' && <div><p className="font-black text-slate-800 text-lg"> {rec.title}</p><div className="flex text-orange-400 mt-1">{[...Array(rec.stars)].map((_,i)=><Star key={i} size={10} fill="currentColor"/>)}</div></div>}
             {rec.itemType === 'cube' && <p className="font-black text-slate-800 text-lg"> 기록 측정: <span className="text-purple-700 font-mono">{rec.time}초</span></p>}
             {rec.itemType === 'baduk' && <div className="space-y-2"><div className="flex items-center gap-2"><span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${rec.type==='success'?'bg-indigo-500':'bg-orange-500'}`}>{rec.type==='success'?'성공':'경험'}</span><span className="text-sm font-black text-slate-600">상대: {String(rec.opponent)}</span></div><div className="flex items-center gap-2 p-3 bg-white/50 rounded-2xl border border-indigo-100/50"><div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">{renderIcon(rec.highlightIcon, 18)}</div><p className="text-base font-black text-indigo-900 leading-none">훈장: {String(rec.highlightLabel)}</p></div></div>}
           </div>
         ))}
      </section>
    </div>
  );
};

export default RecordView;
