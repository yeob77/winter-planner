import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { 
  Award, Target, ShieldCheck, Zap, Lightbulb, Sparkles, Flame, Heart 
} from 'lucide-react';

import type { AllData, DayData, Settings, Task, View, RecordItem, BookRecord, CubeRecord } from './types';

import Header from './components/Header';
import NavBar from './components/NavBar';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import RecordView from './components/RecordView';
import DiaryView from './components/DiaryView';
import StatsView from './components/StatsView';
import TaskModal from './components/TaskModal';

const App = () => {
  const getTodayStr = (date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
  };

  const getTimeStr = () => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const defaultBadukHighlights = [
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

  const [view, setView] = useState<View>('calendar'); 
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const initialStore = loadData();
  const [allData, setAllData] = useState<AllData>(initialStore.data);
  const [settings, setSettings] = useState<Settings>(initialStore.settings);
  
  const [recordType, setRecordType] = useState<'reading' | 'cube' | 'baduk'>('reading'); 
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
    return allData[dateStr] || { tasks: [], cubeRecords: [], books: [], badukRecords: [], diaryText: '', diaryDrawing: null, emotion: '' };
  };

  const currentDayData = getCurrentDayData(selectedDate);

  const updateDayData = (dateStr: string, newData: Partial<DayData>) => {
    setAllData(prev => ({
      ...prev,
      [dateStr]: { ...getCurrentDayData(dateStr), ...newData }
    }));
  };

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
      return { 
        ...prev, 
        multiDates: isSelected ? prev.multiDates.filter(d => d !== dateStr) : [...prev.multiDates, dateStr] 
      };
    });
  };

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

  const addHighlight = () => {
    setSettings(prev => ({
      ...prev,
      badukHighlights: [...prev.badukHighlights, { id: Date.now(), label: '새 칭찬', icon: 'Sparkles' }]
    }));
  };

  const updateHighlight = (id: number, newLabel: string) => {
    setSettings(prev => ({
      ...prev,
      badukHighlights: prev.badukHighlights.map(h => h.id === id ? { ...h, label: newLabel } : h)
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

  const stats = useMemo(() => {
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
  }, [allData]);

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
      <Header settings={settings} stickerCount={stats.sticker} />

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {view === 'calendar' && (
          <CalendarView
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            allData={allData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setView={setView}
            getTodayStr={getTodayStr}
          />
        )}
        {view === 'day' && (
          <DayView
            selectedDate={selectedDate}
            currentDayData={currentDayData}
            setView={setView}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            setEditingTask={setEditingTask}
            setTaskForm={setTaskForm}
            setIsTaskModalOpen={setIsTaskModalOpen}
            taskForm={taskForm}
          />
        )}
        {view === 'record' && (
          <RecordView
            recordType={recordType}
            setRecordType={setRecordType}
            newBookTitle={newBookTitle}
            setNewBookTitle={setNewBookTitle}
            newBookStars={newBookStars}
            setNewBookStars={setNewBookStars}
            newCubeRecord={newCubeRecord}
            setNewCubeRecord={setNewCubeRecord}
            badukDetail={badukDetail}
            setBadukDetail={setBadukDetail}
            settings={settings}
            isEditingHighlights={isEditingHighlights}
            setIsEditingHighlights={setIsEditingHighlights}
            updateHighlight={updateHighlight}
            deleteHighlight={deleteHighlight}
            addHighlight={addHighlight}
            addRecord={addRecord}
            deleteRecord={deleteRecord}
            combinedRecords={combinedRecords}
            renderIcon={renderIcon}
          />
        )}
        {view === 'diary' && (
          <DiaryView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            moveDate={moveDate}
            diaryRef={diaryRef}
            canvasRef={canvasRef}
            currentDayData={currentDayData}
            updateDayData={updateDayData}
            emotionsMap={emotionsMap}
            isEraser={isEraser}
            setIsEraser={setIsEraser}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            startDrawing={startDrawing}
            draw={draw}
            stopDrawing={stopDrawing}
            handleUndo={handleUndo}
            clearCanvas={clearCanvas}
            saveDiaryAsImage={saveDiaryAsImage}
          />
        )}
        {view === 'stats' && <StatsView stats={stats} />}
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        setIsOpen={setIsTaskModalOpen}
        editingTask={editingTask}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        handleSaveTask={handleSaveTask}
        toggleDateSelection={toggleDateSelection}
        currentMonth={currentMonth}
      />

      <NavBar view={view} setView={setView} />
    </div>
  );
};

export default App;
