import React from 'react';
import { ArrowLeft, ClipboardList, Plus, CheckCircle, Circle, Star, Edit2, Trash2, Layers } from 'lucide-react';
import type { DayData, View, Task } from '../types';

interface DayViewProps {
  selectedDate: string;
  currentDayData: DayData;
  setView: (view: View) => void;
  toggleTask: (taskId: number) => void;
  deleteTask: (taskId: number) => void;
  setEditingTask: (task: Task | null) => void;
  setTaskForm: (form: any) => void; // Consider creating a specific type for the form
  setIsTaskModalOpen: (isOpen: boolean) => void;
  taskForm: any;
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  currentDayData,
  setView,
  toggleTask,
  deleteTask,
  setEditingTask,
  setTaskForm,
  setIsTaskModalOpen,
  taskForm,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between px-2">
        <button onClick={() => setView('calendar')} className="flex items-center gap-1 font-black text-slate-400 hover:text-indigo-600 transition-all">
          <ArrowLeft size={18} /> 달력으로
        </button>
        <h2 className="text-xl font-black text-indigo-900">{selectedDate}</h2>
      </div>
      
      <section className="bg-white rounded-[40px] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-green-50/30 flex justify-between items-center">
          <h3 className="font-black text-xl text-green-700 flex items-center gap-2"><ClipboardList /> 성장 미션</h3>
          <button 
            onClick={() => { 
              setEditingTask(null); 
              setTaskForm({...taskForm, title: '', range: 'today', multiDates: [selectedDate]}); 
              setIsTaskModalOpen(true); 
            }}
            className="bg-green-500 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="p-6 space-y-4 min-h-[300px]">
          {currentDayData.tasks.length > 0 ? currentDayData.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 animate-in slide-in-from-left duration-200">
              <div onClick={() => toggleTask(task.id)} className={`flex-1 flex items-center p-5 rounded-3xl transition-all border-2 ${task.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-indigo-100 cursor-pointer shadow-sm active:scale-95'}`}>
                {task.completed ? <CheckCircle className="text-green-500 mr-4 shrink-0" size={32} /> : <Circle className="text-slate-200 mr-4 shrink-0" size={32} />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{task.category}</span>
                    {task.isPriority && <span className="bg-yellow-400 text-[9px] font-black px-2 py-0.5 rounded-full text-white flex items-center gap-1"><Star size={10} fill="white"/> 대장</span>}
                  </div>
                  <p className={`text-lg font-black ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setEditingTask(task); setTaskForm({ ...taskForm, title: task.title, category: task.category, isPriority: task.isPriority, range: 'today' }); setIsTaskModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-500 transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => deleteTask(task.id)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"><Trash2 size={16} /></button>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-2">
              <Layers size={48} className="opacity-20" />
              <p className="font-bold italic">오늘 계획을 추가해보세요!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DayView;
