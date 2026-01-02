import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  CheckCircle, Circle, Edit2, Plus, Trash2, 
  Award, ChevronLeft, ChevronRight, 
  Timer, LayoutGrid, ListChecks, ArrowLeft, BookOpen, Star,
  BarChart3, TrendingUp, Trophy, Swords, Target, Flame, Heart,
  PenLine, Sparkles, Eraser, CalendarDays, ClipboardList, Clock,
  Lightbulb, ShieldCheck, Zap, X, Check, Undo2, Download,
  Layers, CalendarCheck
} from 'lucide-react';

// Basic types for our data structures
type Task = {
  id: number;
  title: string;
  category: string;
  isPriority: boolean;
  completed: boolean;
};

type BookRecord = { title: string; stars: number; timestamp: string; };
type CubeRecord = { time: number; timestamp: string; };
type BadukRecord = { type: string; opponent: string; highlightId: number; highlightLabel: string; highlightIcon: string; timestamp: string; };

type DayData = {
  tasks: Task[];
  cubeRecords: CubeRecord[];
  books: BookRecord[];
  badukRecords: BadukRecord[];
  diaryText: string;
  diaryDrawing: string | null;
  emotion: string;
};

type AllData = {
  [date: string]: DayData;
};

type BadukHighlight = { id: number; label: string; icon: string; };

type Settings = {
  badukHighlights: BadukHighlight[];
  level: number;
  exp: number;
};

type RecordItem = (BookRecord & {itemType: 'book'}) | (CubeRecord & {itemType: 'cube'}) | (BadukRecord & {itemType: 'baduk'});


const App = () => {
  const getTodayStr = (date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 10);
  };

  const getTimeStr = () => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const defaultBadukHighlights: BadukHighlight[] = [
    { id: 1, label: '엄청 집중했어요!', icon: 'Target' },
    { id: 2, label: '예의를 지켰어요', icon: 'ShieldCheck' },
    { id: 3, label: '포기하지 않았어요', icon: 'Zap' },
    { id: 4, label: '멋진 수를 뒀어요', icon: 'Lightbulb' }
  ];

  const loadData = (): { settings: Settings; data: AllData } => {
    try {
      const saved = localStorage.getItem('winter_planner_v11');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && parsed.settings) {
          // Ensure level and exp are numbers on load
          parsed.settings.level = Number(parsed.settings.level) || 1;
          parsed.settings.exp = Number(parsed.settings.exp) || 0;
          return parsed;
        }
      }
    } catch (e) {}
    
    return {
      settings: { 
        badukHighlights: [...defaultBadukHighlights],
        level: 1, exp: 0
      },
      data: {
        [getTodayStr()]: {
          tasks: [],
          cubeRecords: [],
          books: [],
          badukRecords: [],
          diaryText: '', diaryDrawing: null, emotion: '' 
        }
      }
    };
  };

  const [view, setView] = useState('calendar'); 
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const initialStore = loadData();
  const [allData, setAllData] = useState<AllData>(initialStore.data);
  const [settings, setSettings] = useState<Settings>(initialStore.settings);
  
  const [recordType, setRecordType] = useState('reading'); 
  const [isEditingHighlights, setIsEditingHighlights] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: '', category: '공부', isPriority: false, range: 'today', multiDates: [getTodayStr()] 
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const diaryRef = useRef<HTMLElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#334155');
  const [isEraser, setIsEraser] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<string[]>([]);

  const [newCubeRecord, setNewCubeRecord] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookStars, setNewBookStars] = useState(0);

  useEffect(() => {
    localStorage.setItem('winter_planner_v11', JSON.stringify({ settings, data: allData }));
  }, [allData, settings]);

  const getCurrentDayData = (dateStr: string): DayData => {
    if (!allData[dateStr]) {
      return { tasks: [], cubeRecords: [], books: [], badukRecords: [], diaryText: '', diaryDrawing: null, emotion: '' };
    }
    return allData[dateStr];
  };

  const currentDayData = getCurrentDayData(selectedDate);

  const updateDayData = (dateStr: string, newData: Partial<DayData>) => {
    setAllData(prev => ({
      ...prev,
      [dateStr]: { ...getCurrentDayData(dateStr), ...newData }
    }));
  };

  // --- 할 일 관리 핵심 기능 ---
  const handleSaveTask = () => {
    if (!taskForm.title.trim()) return;

    const newTaskBase = {
      id: editingTask ? editingTask.id : Date.now(),
      title: taskForm.title,
      category: taskForm.category,
      isPriority: taskForm.isPriority,
      completed: false
    };

    let targetDates: string[] = [];
    if (taskForm.range === 'today') {
      targetDates = [selectedDate];
    } else if (taskForm.range === 'period') {
      targetDates = taskForm.multiDates;
    } else if (taskForm.range === 'all') {
      let start = new Date(selectedDate);
      let end = new Date(start.getFullYear(), 1, 28); 
      while (start <= end) {
        targetDates.push(getTodayStr(new Date(start)));
        start.setDate(start.getDate() + 1);
      }
    }

    const newAllData = { ...allData };
    targetDates.forEach(date => {
      const existingDayData = getCurrentDayData(date);
      let updatedTasks;
      if (editingTask) {
        updatedTasks = existingDayData.tasks.map(t => t.id === editingTask.id ? { ...t, ...newTaskBase } : t);
      } else {
        updatedTasks = [...existingDayData.tasks, { ...newTaskBase, id: Date.now() + Math.random() }];
      }
      newAllData[date] = { ...existingDayData, tasks: updatedTasks };
    });

    setAllData(newAllData);
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskForm({ ...taskForm, title: '', isPriority: false, multiDates: [selectedDate] });
  };

  const deleteTask = (taskId: number) => {
    if (!window.confirm("이 할 일을 정말 삭제할까요?")) return;
    
    const updatedTasks = currentDayData.tasks.filter(t => t.id !== taskId);
    updateDayData(selectedDate, { tasks: updatedTasks });
  };

  const toggleTask = (taskId: number) => {
    const updatedTasks = currentDayData.tasks.map(t => {
      if (t.id === taskId) {
        const newStatus = !t.completed;
        if (newStatus) {
          setSettings(prev => {
            const currentExp = Number(prev.exp) || 0;
            const currentLevel = Number(prev.level) || 1;
            let newExp = currentExp + 10;
            let newLevel = currentLevel;
            if (newExp >= 100) {
              newExp = 0;
              newLevel = currentLevel + 1;
            }
            return { ...prev, exp: newExp, level: newLevel };
          });
        }
        return { ...t, completed: newStatus };
      }
      return t;
    });
    updateDayData(selectedDate, { tasks: updatedTasks });
  };

  const toggleDateSelection = (dateStr: string) => {
    setTaskForm(prev => {
      const isSelected = prev.multiDates.includes(dateStr);
      if (isSelected) {
        return { ...prev, multiDates: prev.multiDates.filter(d => d !== dateStr) };
      } else {
        return { ...prev, multiDates: [...prev.multiDates, dateStr] };
      }
    });
  };

  // --- 기록 로직 ---
  const addRecord = (type: 'reading' | 'cube' | 'baduk', data: any) => {
    const timestamp = getTimeStr();
    if (type === 'reading') {
      updateDayData(selectedDate, { books: [...currentDayData.books, { ...data, timestamp }] });
      setNewBookTitle(''); setNewBookStars(0);
      setSettings(prev => ({...prev, exp: (Number(prev.exp) || 0) + 15}));
    } else if (type === 'cube') {
      updateDayData(selectedDate, { cubeRecords: [...currentDayData.cubeRecords, { time: parseFloat(data), timestamp }] });
      setNewCubeRecord('');
      setSettings(prev => ({...prev, exp: (Number(prev.exp) || 0) + 5}));
    } else if (type === 'baduk') {
      const selectedHighlight = settings.badukHighlights.find(h => h.id === data.highlightId);
      const recordData = { ...data, highlightLabel: String(selectedHighlight?.label || '기록 없음'), highlightIcon: String(selectedHighlight?.icon || 'Award'), timestamp };
      updateDayData(selectedDate, { badukRecords: [...(currentDayData.badukRecords || []), recordData] });
      setSettings(prev => ({...prev, exp: (Number(prev.exp) || 0) + 20}));
    }
  };

  // --- 바둑 칭찬 관리 ---
  const addHighlight = () => {
    setSettings(prev => ({
      ...prev,
      badukHighlights: [
        ...prev.badukHighlights,
        { id: Date.now(), label: '새 칭찬', icon: 'Sparkles' }
      ]
    }));
  };

  const updateHighlight = (id: number, newLabel: string) => {
    setSettings(prev => ({
      ...prev,
      badukHighlights: prev.badukHighlights.map(h => 
        h.id === id ? { ...h, label: newLabel } : h
      )
    }));
  };

  const deleteHighlight = (id: number) => {
    if (settings.badukHighlights.length <= 1) {
      alert("최소 1개의 칭찬은 남겨두어야 합니다.");
      return;
    }
    if (window.confirm("이 칭찬을 삭제할까요?")) {
      setSettings(prev => ({
        ...prev,
        badukHighlights: prev.badukHighlights.filter(h => h.id !== id)
      }));
    }
  };


  // --- 캔버스 드로잉 ---
  useEffect(() => {
    if (view === 'diary' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      
      if (currentDayData.diaryDrawing) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, 800, 420);
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(img, 0, 0);
        };
        img.src = currentDayData.diaryDrawing;
      } else {
        ctx.clearRect(0, 0, 800, 420);
      }
    }
  }, [view, selectedDate, currentDayData.diaryDrawing]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if(!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = isEraser ? 40 : 4;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if(!isDrawing) return;
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    if('touches' in e) e.preventDefault();
  };

  const stopDrawing = () => {
    if(!isDrawing) return;
    setIsDrawing(false);
    if(canvasRef.current) {
      const url = canvasRef.current.toDataURL();
      updateDayData(selectedDate, { diaryDrawing: url });
      setDrawingHistory(p => [...p, url].slice(-20));
    }
  };

  const handleUndo = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (drawingHistory.length <= 1) { 
      ctx.clearRect(0,0,800,420);
      updateDayData(selectedDate, { diaryDrawing: null });
      setDrawingHistory([]);
      return;
    }
    const newHist = [...drawingHistory];
    newHist.pop();
    const prevState = newHist[newHist.length - 1];
    const img = new Image();
    img.onload = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0,0,800,420);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0);
      updateDayData(selectedDate, { diaryDrawing: prevState });
    };
    img.src = prevState;
    setDrawingHistory(newHist);
  };

  const clearCanvas = (withConfirm = true) => {
    if (withConfirm && !window.confirm("그림을 모두 지울까요?")) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, 800, 420);
      updateDayData(selectedDate, { diaryDrawing: null });
      setDrawingHistory([]);
    }
  };

  const saveDiaryAsImage = async () => {
    if (diaryRef.current) {
      const snap = await html2canvas(diaryRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `성장일기_${selectedDate}.png`;
      link.href = snap.toDataURL();
      link.click();
    }
  };

  const moveDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(getTodayStr(date));
    setDrawingHistory([]); 
  };

  const stats = (() => {
    const allBooks: (BookRecord & {date: string})[] = []; 
    const allCube: (CubeRecord & {date: string})[] = []; 
    let sticker = 0;
    Object.keys(allData).forEach(d => {
      const day = allData[d];
      day.books.forEach(b => allBooks.push({...b, date: d}));
      day.cubeRecords.forEach(c => allCube.push({...c, date: d}));
      if (day.tasks.length > 0 && day.tasks.every(t => t.completed)) sticker++;
    });
    return { allBooks, allCube, best: allCube.length ? Math.min(...allCube.map(c => c.time)) : null, sticker };
  })();

  const renderIcon = (name: string, size=16) => {
    const icons: {[key: string]: React.ElementType} = { Target, ShieldCheck, Zap, Lightbulb, Award, Heart, Sparkles, Flame };
    const Icon = icons[name] || Award;
    return <Icon size={size} />;
  };

  const emotionsMap: {[key: string]: string} = { 'happy': '😄', 'good': '😊', 'soso': '😐', 'sad': '😭', 'excited': '🤩' };

  const [badukDetail, setBadukDetail] = useState({ type: 'success', opponent: 'AI', highlightId: 1 });

  const combinedRecords: RecordItem[] = [
    ...currentDayData.books.map(b => ({ ...b, itemType: 'book' as const })),
    ...currentDayData.cubeRecords.map(c => ({ ...c, itemType: 'cube' as const })),
    ...(currentDayData.badukRecords || []).map(ba => ({ ...ba, itemType: 'baduk' as const })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const deleteRecord = (record: RecordItem) => {
      if (!window.confirm("이 기록을 삭제할까요?")) return;

      if (record.itemType === 'book') {
          updateDayData(selectedDate, { books: currentDayData.books.filter(b => b.timestamp !== record.timestamp) });
      } else if (record.itemType === 'cube') {
          updateDayData(selectedDate, { cubeRecords: currentDayData.cubeRecords.filter(c => c.timestamp !== record.timestamp) });
      } else if (record.itemType === 'baduk') {
          updateDayData(selectedDate, { badukRecords: (currentDayData.badukRecords || []).filter(b => b.timestamp !== record.timestamp) });
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-lg">L{settings.level}</span>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tighter text-indigo-900 leading-none uppercase tracking-widest">CHAMPION</h1>
              <div className="mt-1.5 w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-700" style={{ width: `${settings.exp}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-2xl border border-yellow-100 shadow-sm">
            <Award size={18} className="text-yellow-600" />
            <span className="text-sm font-black text-yellow-800">{stats.sticker}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        
        {view === 'calendar' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-700">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h2>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50"><ChevronLeft size={20}/></button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors hover:bg-slate-50"><ChevronRight size={20}/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50/30">
                {['일','월','화','수','목','금','토'].map((d, i) => <div key={d} className={`py-4 text-[10px] font-black uppercase ${i===0?'text-red-400':i===6?'text-blue-400':'text-slate-400'}`}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 border-l border-slate-100">
                {(() => {
                  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                  const days = [];
                  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 bg-slate-50/50"></div>);
                  for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isToday = dateStr === getTodayStr();
                    const dayData = allData[dateStr];
                    const isAllDone = dayData?.tasks?.length > 0 && dayData.tasks.every(t => t.completed);
                    days.push(
                      <div key={d} onClick={() => { setSelectedDate(dateStr); setView('day'); }} className={`h-24 border-b border-r border-slate-100 p-2 cursor-pointer transition-all hover:bg-indigo-50 ${selectedDate === dateStr ? 'bg-indigo-50/50' : 'bg-white'}`}>
                        <span className={`text-sm font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-600'}`}>{d}</span>
                        <div className="mt-2 flex flex-col items-center">
                          {isAllDone && <Award className="text-yellow-400 animate-bounce" size={24} fill="#facc15" />}
                        </div>
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-2">
              <button onClick={() => setView('calendar')} className="flex items-center gap-1 font-black text-slate-400 hover:text-indigo-600 transition-all"><ArrowLeft size={18} /> 달력으로</button>
              <h2 className="text-xl font-black text-indigo-900">{selectedDate}</h2>
            </div>
            
            <section className="bg-white rounded-[40px] shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-green-50/30 flex justify-between items-center">
                <h3 className="font-black text-xl text-green-700 flex items-center gap-2"><ClipboardList /> 성장 미션</h3>
                <button 
                  onClick={() => { setEditingTask(null); setTaskForm({...taskForm, title: '', range: 'today', multiDates: [selectedDate]}); setIsTaskModalOpen(true); }}
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
                      <button onClick={() => deleteTask(task.id)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:bg-red-100 transition-colors shadow-sm"><Trash2 size={16} /></button>
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
        )}

        {view === 'record' && (
          <div className="space-y-6 animate-in slide-in-from-bottom pb-10">
            <h2 className="text-2xl font-black text-indigo-900 px-2 text-center uppercase tracking-widest">Growth Entry</h2>
            <div className="flex bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
              {[{ id: 'reading', label: '독서', icon: <BookOpen />, color: 'bg-orange-500' }, { id: 'cube', label: '큐브', icon: <Timer />, color: 'bg-purple-500' }, { id: 'baduk', label: '바둑', icon: <Swords />, color: 'bg-red-500' }].map(t => (
                <button key={t.id} onClick={() => setRecordType(t.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black transition-all ${recordType === t.id ? `${t.color} text-white shadow-lg` : 'text-slate-400'}`}>{t.icon} {t.label}</button>
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
        )}

        {view === 'diary' && (
          <div className="space-y-6 animate-in slide-in-from-right pb-10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
                  <button onClick={() => moveDate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={24}/></button>
                  <div className="relative flex items-center gap-2 px-2 border-x border-slate-100"><CalendarDays size={18} className="text-indigo-500" /><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-slate-700 focus:outline-none cursor-pointer" /></div>
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

            <section ref={diaryRef as React.RefObject<HTMLElement>} className="bg-white rounded-[40px] shadow-2xl border-8 border-indigo-100 overflow-hidden relative flex flex-col">
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
        )}

        {view === 'stats' && (
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
                 {stats.allCube.length > 0 ? stats.allCube.reverse().map((r, i) => (
                   <div key={i} className="flex-1 min-w-[45px] bg-indigo-500 rounded-t-2xl transition-all relative group shadow-sm" style={{ height: `${(Number(r.time) / Math.max(...stats.allCube.map(m => Number(m.time)))) * 100}%` }}>
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl pointer-events-none">{String(r.time)}초 ({String(r.date).slice(5)})</div>
                   </div>
                 )) : <div className="w-full text-center text-slate-300 py-24 font-bold italic">기록을 입력하면 그래프가 나타나요!</div>}
               </div>
            </section>

            <section className="bg-white rounded-[32px] shadow-lg border border-slate-200 overflow-hidden p-6">
              <h3 className="font-black text-xl flex items-center gap-2 mb-4"><BookOpen className="text-orange-500" /> 나의 겨울 도서관</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {stats.allBooks.length > 0 ? stats.allBooks.reverse().map((b, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-white shadow-sm hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col text-left"><span className="text-[10px] font-black text-slate-400 mb-1">{b.date}</span><span className="font-black text-slate-800 text-lg">{b.title}</span></div>
                    <div className="flex text-orange-400 gap-0.5">{[...Array(b.stars)].map((_,i)=><Star key={i} size={14} fill="currentColor"/>)}</div>
                  </div>
                )) : <p className="text-center py-20 text-slate-300 font-bold italic">아직 읽은 책이 없어요.</p>}
              </div>
            </section>
          </div>
        )}
      </main>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-indigo-900">{editingTask ? '할 일 수정' : '새 계획 만들기'}</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={24}/></button>
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
                      {(() => {
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
                      })()}
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
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-4 flex justify-around items-center z-50 shadow-2xl">
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'calendar' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}><LayoutGrid size={24} /><span className="text-[9px] font-black uppercase tracking-tighter">달력</span></button>
        <button onClick={() => setView('day')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'day' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}><ListChecks size={24} /><span className="text-[9px] font-black uppercase tracking-tighter">할 일</span></button>
        <button onClick={() => setView('record')} className={`flex flex-col items-center gap-1 w-20 h-20 -mt-10 bg-white rounded-full border-4 border-slate-50 shadow-2xl transition-all ${view === 'record' ? 'text-indigo-600 scale-110' : 'text-slate-500'}`}>
          <div className={`mt-3 p-3 rounded-full ${view === 'record' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-slate-100'}`}><Plus size={28} strokeWidth={3} /></div>
          <span className="text-[10px] font-black mt-1 uppercase">기록</span>
        </button>
        <button onClick={() => setView('diary')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'diary' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}><PenLine size={24} /><span className="text-[9px] font-black uppercase tracking-tighter">일기</span></button>
        <button onClick={() => setView('stats')} className={`flex flex-col items-center gap-1 w-16 transition-all ${view === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}><BarChart3 size={24} /><span className="text-[9px] font-black uppercase tracking-tighter">리포트</span></button>
      </nav>
    </div>
  );
};

export default App;