import React from 'react';
import { ChevronLeft, ChevronRight, Download, Undo2, Trash2, PenLine, Eraser, CalendarDays } from 'lucide-react';
import type { DayData } from '../types';

interface DiaryViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  moveDate: (days: number) => void;
  diaryRef: React.Ref<HTMLElement>;
  canvasRef: React.Ref<HTMLCanvasElement>;
  currentDayData: DayData;
  updateDayData: (date: string, data: Partial<DayData>) => void;
  emotionsMap: { [key: string]: string };
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  startDrawing: (e: React.MouseEvent | React.TouchEvent) => void;
  draw: (e: React.MouseEvent | React.TouchEvent) => void;
  stopDrawing: () => void;
  handleUndo: () => void;
  clearCanvas: (withConfirm?: boolean) => void;
  saveDiaryAsImage: () => void;
}

const DiaryView: React.FC<DiaryViewProps> = ({
  selectedDate,
  setSelectedDate,
  moveDate,
  diaryRef,
  canvasRef,
  currentDayData,
  updateDayData,
  emotionsMap,
  isEraser,
  setIsEraser,
  brushColor,
  setBrushColor,
  startDrawing,
  draw,
  stopDrawing,
  handleUndo,
  clearCanvas,
  saveDiaryAsImage,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right pb-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
            <button onClick={() => moveDate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={24}/></button>
            <div className="relative flex items-center gap-2 px-2 border-x border-slate-100">
              <CalendarDays size={18} className="text-indigo-500" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-slate-700 focus:outline-none cursor-pointer" />
            </div>
            <button onClick={() => moveDate(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={24}/></button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button onClick={saveDiaryAsImage} className="flex items-center gap-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
              <Download size={18} /> 이미지 저장
            </button>
            <button onClick={handleUndo} className="p-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"><Undo2 size={18} /></button>
            <button onClick={() => clearCanvas(true)} className="p-3 bg-red-50 border border-red-100 rounded-2xl font-bold text-red-500 shadow-sm hover:bg-red-100 transition-all"><Trash2 size={18} /></button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-center gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border-2 border-slate-200">
            <button 
              onClick={() => setIsEraser(false)} 
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black transition-all ${!isEraser ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-500'}`}
            >
              <PenLine size={18} /> 펜
            </button>
            <button 
              onClick={() => setIsEraser(true)} 
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black transition-all border-2 ${isEraser ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'}`}
            >
              <Eraser size={18} /> 지우개
            </button>
          </div>
          {!isEraser && (
            <div className="flex gap-2">
              {['#334155', '#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7'].map(color => (
                <button key={color} onClick={() => setBrushColor(color)} className={`w-8 h-8 rounded-full transition-transform ${brushColor === color ? 'scale-125 ring-2 ring-indigo-200 shadow-lg' : ''}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <section ref={diaryRef} className="bg-white rounded-[40px] shadow-2xl border-8 border-indigo-100 overflow-hidden relative flex flex-col">
        <div className="p-6 bg-indigo-50/50 flex justify-around">
          {Object.entries(emotionsMap).map(([k, e]) => (
            <button key={k} onClick={() => updateDayData(selectedDate, { emotion: k })} className={`text-4xl transition-all transform ${currentDayData.emotion === k ? 'scale-125 rotate-6' : 'opacity-20 grayscale'}`}>{e}</button>
          ))}
        </div>
        
        <div className="bg-white relative touch-none border-b-4 border-dashed border-indigo-50" style={{ height: '420px' }}>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={420} 
            className={`w-full h-full ${isEraser ? 'cursor-cell' : 'cursor-crosshair'}`}
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} 
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} 
          />
        </div>
        
        <div className="p-10 bg-white min-h-[350px] relative" style={{ backgroundImage: 'repeating-linear-gradient(#fff, #fff 44px, #f1f5f9 45px)' }}>
          <div className="absolute top-0 left-16 w-1 h-full bg-red-100/50"></div>
          <div className="absolute top-4 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{selectedDate}</div>
          <textarea 
            value={currentDayData.diaryText || ''} 
            onChange={(e) => updateDayData(selectedDate, { diaryText: e.target.value })} 
            placeholder="이야기를 적어보자!" 
            className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 font-black text-slate-700 text-xl md:text-2xl resize-none leading-[45px] pl-10 overflow-hidden shadow-none" 
          />
        </div>
      </section>
    </div>
  );
};

export default DiaryView;
