import React from 'react';
import { Award } from 'lucide-react';
import type { Settings } from '../types';

interface HeaderProps {
  settings: Settings;
  stickerCount: number;
}

const Header: React.FC<HeaderProps> = ({ settings, stickerCount }) => {
  return (
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
          <span className="text-sm font-black text-yellow-800">{stickerCount}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
