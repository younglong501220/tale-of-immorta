import React from 'react';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';

interface Props {
  activeTab: 'explore' | 'sect' | 'auction' | 'meditate' | 'bag' | 'alliance';
  onSelectTab: (tab: 'explore' | 'sect' | 'auction' | 'meditate' | 'bag' | 'alliance') => void;
  bagCount: number;
  hasAlliance: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetGame: () => void;
  onOpenHelp: () => void;
}

export const HeaderNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  bagCount,
  hasAlliance,
  soundEnabled,
  onToggleSound,
  onResetGame,
  onOpenHelp,
}) => {
  return (
    <>
      {/* Auspicious Inscription Banner */}
      <div className="bg-gradient-to-r from-[#140e24] via-[#22163d] to-[#140e24] border-b border-amber-500/40 text-amber-200 text-xs py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 select-none shadow-sm z-30">
        <span className="text-amber-400 text-xs">☸️</span>
        <span className="font-serif tracking-widest font-semibold text-amber-300">
          吳永隆製作，2026。音聲禪院，南無無量音聲王佛。
        </span>
        <span className="text-amber-400 text-xs">☸️</span>
      </div>

      <header className="h-14 shrink-0 bg-[#121620] border-b border-[#262c3b] flex items-center justify-between px-4 md:px-6 shadow-md z-20">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2">
        <span className="text-xl">☯️</span>
        <h1 className="text-base md:text-lg font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 whitespace-nowrap">
          鬼谷八荒 · 逆天改命
        </h1>
      </div>

      {/* Zone 2: Navigation Tabs (Segmented interactive buttons) */}
      <nav className="hidden md:flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-[#202738]">
        <button
          onClick={() => {
            sound.playDing();
            onSelectTab('explore');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'explore'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🗺️ 大荒探索
        </button>

        <button
          onClick={() => {
            sound.playDing();
            onSelectTab('auction');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'auction'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🏛️ 萬寶拍賣 & 奪寶
        </button>

        <button
          onClick={() => {
            sound.playDing();
            onSelectTab('sect');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sect'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⛩️ 正邪宗門
        </button>

        <button
          onClick={() => {
            sound.playWarDrum();
            onSelectTab('alliance');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'alliance'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚔️ 跨服仙盟 · 領地爭奪
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        <button
          onClick={() => {
            sound.playDing();
            onSelectTab('meditate');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'meditate'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🧘 洞府閉關
        </button>

        <button
          onClick={() => {
            sound.playDing();
            onSelectTab('bag');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'bag'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🎒 儲物仙戒
          {bagCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'bag' ? 'bg-slate-950 text-amber-300' : 'bg-amber-600/30 text-amber-300'
              }`}
            >
              {bagCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Functional Utilities */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? '關閉音效' : '開啟音效'}
          className="p-2 rounded-lg bg-[#181d28] hover:bg-[#232938] border border-slate-700/80 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          title="遊戲玩法指南"
          className="p-2 rounded-lg bg-[#181d28] hover:bg-[#232938] border border-slate-700/80 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Restart / Reset */}
        <button
          onClick={onResetGame}
          title="轉世重修 (重新開局)"
          className="p-2 rounded-lg bg-[#181d28] hover:bg-rose-950 border border-slate-700/80 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
    </>
  );
};
