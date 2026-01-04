// src/types.ts

export type Task = {
  id: number;
  title: string;
  category: string;
  isPriority: boolean;
  completed: boolean;
};

export type BookRecord = { title: string; stars: number; timestamp: string; };
export type CubeRecord = { time: number; timestamp: string; };
export type BadukRecord = { type: string; opponent: string; highlightId: number; highlightLabel: string; highlightIcon: string; timestamp: string; };

export type DayData = {
  tasks: Task[];
  cubeRecords: CubeRecord[];
  books: BookRecord[];
  badukRecords: BadukRecord[];
  diaryText: string;
  diaryDrawing: string | null;
  emotion: string;
};

export type AllData = {
  [date: string]: DayData;
};

export type BadukHighlight = { id: number; label: string; icon: string; };

export type Settings = {
  badukHighlights: BadukHighlight[];
  level: number;
  exp: number;
};

export type RecordItem = (BookRecord & {itemType: 'book'}) | (CubeRecord & {itemType: 'cube'}) | (BadukRecord & {itemType: 'baduk'});

export type View = 'calendar' | 'day' | 'record' | 'diary' | 'stats';
