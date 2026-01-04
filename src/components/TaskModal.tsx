import React from 'react';
import { X, Plus, Check, Star, CalendarCheck } from 'lucide-react';
import type { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingTask: Task | null;
  taskForm: any; // Replace with a specific type later
  setTaskForm: (form: any) => void;
  handleSaveTask: () => void;
  toggleDateSelection: (dateStr: string) => void;
  currentMonth: Date;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  setIsOpen,
  editingTask,
  taskForm,
  setTaskForm,
  handleSaveTask,
  toggleDateSelection,
  currentMonth,
}) => {
  if (!isOpen) return null;

  const renderDateSelection = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dInMonth = new Date(year, month + 1, 0).getDate();
    const firstD = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstD; i++) days.push(<div key={`m-empty-${i}`}></div>);
    for (let d = 1; d <= dInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSel = taskForm.multiDates.includes(dStr);
      days.push(
        <button key={dStr} onClick={() => toggleDateSelection(dStr)} className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${isSel ? 'bg-indigo-600 text-white shadow-md scale-110' : 'bg-white text-slate-500 hover:bg-white/80 shadow-sm'}`}>{d}</button>
      );
    }
    return days;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-indigo-900">{editingTask ? '할 일 수정' : '새 계획 만들기'}</h3>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={24}/></button>
        </div>
        
        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">무엇을 할까?</label>
            <input 
              autoFocus
              type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-black text-lg text-slate-700 outline-none focus:border-indigo-400"
              placeholder="예: 줄넘기 100개"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select value={taskForm.category} onChange={(e) => setTaskForm({...taskForm, category: e.target.value})} className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-black text-slate-700 outline-none">
              <option value="공부"> 공부</option><option value="운동">⚽ 운동</option><option value="생활"> 생활</option><option value="독서"> 독서</option><option value="큐브"> 큐브</option>
            </select>
            <button 
              onClick={() => setTaskForm({...taskForm, isPriority: !taskForm.isPriority})}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 font-black transition-all ${taskForm.isPriority ? 'bg-yellow-400 border-yellow-400 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
            >
              <Star size={16} fill={taskForm.isPriority ? "white" : "none"} /> 대장 할일
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">언제 할까?</label>
            <div className="flex gap-2">
              {['today','period','all'].map(r => (
                <button key={r} onClick={() => setTaskForm({...taskForm, range: r})} className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${taskForm.range === r ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                  {r === 'today' ? '오늘만' : r === 'period' ? '날짜 선택' : '방학 내내'}
                </button>
              ))}
            </div>
            
            {taskForm.range === 'period' && (
              <div className="p-4 bg-indigo-50 rounded-3xl animate-in zoom-in duration-300">
                <p className="text-[10px] font-black text-indigo-400 mb-3 text-center uppercase tracking-tighter flex items-center justify-center gap-1"><CalendarCheck size={12}/> 날짜를 눌러서 선택하세요</p>
                <div className="grid grid-cols-7 gap-1">
                  {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[9px] font-black text-slate-300 text-center py-1">{d}</div>)}
                  {renderDateSelection()}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSaveTask}
            className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {editingTask ? <Check size={24} strokeWidth={3}/> : <Plus size={24} strokeWidth={3}/>} {editingTask ? '수정 완료' : '계획에 추가'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
