import React from 'react';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import type { AllData, View } from '../types';

interface CalendarViewProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  allData: AllData;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setView: (view: View) => void;
  getTodayStr: () => string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  setCurrentMonth,
  allData,
  selectedDate,
  setSelectedDate,
  setView,
  getTodayStr,
}) => {
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 bg-slate-50/50"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === getTodayStr();
      const dayData = allData[dateStr];
      const isAllDone = dayData?.tasks?.length > 0 && dayData.tasks.every(t => t.completed);
      
      days.push(
        <div
          key={d}
          onClick={() => {
            setSelectedDate(dateStr);
            setView('day');
          }}
          className={`h-24 border-b border-r border-slate-100 p-2 cursor-pointer transition-all hover:bg-indigo-50 ${selectedDate === dateStr ? 'bg-indigo-50/50' : 'bg-white'}`}
        >
          <span className={`text-sm font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-600'}`}>
            {d}
          </span>
          <div className="mt-2 flex flex-col items-center">
            {isAllDone && <Award className="text-yellow-400 animate-bounce" size={24} fill="#facc15" />}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-700">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
              <ChevronLeft size={20}/>
            </button>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50">
              <ChevronRight size={20}/>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50/30">
          {['일','월','화','수','목','금','토'].map((d, i) => (
            <div key={d} className={`py-4 text-[10px] font-black uppercase ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-slate-100">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
