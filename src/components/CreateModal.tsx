import React, { useState } from 'react';
import { ALL_TRAITS } from '../data/gameData';
import { Trait } from '../types/game';
import { sound } from '../utils/audio';
import { Dices, Lock, Unlock, Sparkles, Wand2 } from 'lucide-react';

interface Props {
  onStartGame: (name: string, gender: 'male' | 'female', traits: Trait[]) => void;
}

const RANDOM_NAMES = [
  '韓立', '厲飛雨', '白小純', '蕭炎', '王林', '方平', '孟浩', '蘇銘', '石昊', '林動', '徐鳳年', '陳平安'
];

export const CreateModal: React.FC<Props> = ({ onStartGame }) => {
  const [name, setName] = useState<string>('韓立');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [slots, setSlots] = useState<{ trait: Trait; locked: boolean }[]>(() => {
    // Pick 3 initial traits
    const shuffled = [...ALL_TRAITS].sort(() => 0.5 - Math.random());
    return [
      { trait: shuffled[0], locked: false },
      { trait: shuffled[1], locked: false },
      { trait: shuffled[2], locked: false },
    ];
  });
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const rollTraits = () => {
    sound.playDice();
    setIsRolling(true);

    setTimeout(() => {
      // Keep locked traits, randomize unlocked ones
      const lockedIds = new Set(slots.filter((s) => s.locked).map((s) => s.trait.id));
      const pool = ALL_TRAITS.filter((t) => !lockedIds.has(t.id));
      const shuffled = [...pool].sort(() => 0.5 - Math.random());

      let poolIdx = 0;
      const nextSlots = slots.map((s) => {
        if (s.locked) return s;
        const newTrait = shuffled[poolIdx++] || s.trait;
        return { ...s, trait: newTrait };
      });

      setSlots(nextSlots);
      setIsRolling(false);

      // Check if any red trait rolled
      if (nextSlots.some((s) => s.trait.rarity === 'red')) {
        sound.playDing();
      }
    }, 220);
  };

  const toggleLock = (index: number) => {
    sound.playDing();
    setSlots((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, locked: !s.locked } : s))
    );
  };

  const randomizeName = () => {
    sound.playDing();
    const pick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(pick);
  };

  const handleStart = () => {
    sound.playBreakthrough();
    const finalTraits = slots.map((s) => s.trait);
    onStartGame(name.trim() || '無名修士', gender, finalTraits);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#141820] border-2 border-amber-600/80 rounded-xl p-6 md:p-8 shadow-[0_0_50px_rgba(217,119,6,0.3)] text-slate-200 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 鴻蒙初闢 · 天命輪迴 <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            ✦ 鬼谷八荒 · 轉世降生 ✦
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            投胎轉世之際，請隨機搖取先天氣運以逆天改命。可鎖定心儀氣運，洗出神級紅光天賦！
          </p>
        </div>

        {/* Character Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">道號（修仙姓名）：</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                maxLength={10}
                onChange={(e) => setName(e.target.value)}
                placeholder="輸入道號..."
                className="flex-1 bg-[#0b0e14] border border-[#2d3443] focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-amber-200 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={randomizeName}
                title="隨機經典修仙道號"
                className="px-3 py-2 bg-[#1f2633] hover:bg-[#283244] border border-slate-700 rounded-lg text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" /> 隨機
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">陰陽道身：</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-[#181d26] border-slate-700 text-slate-400'
                }`}
              >
                乾道 (男修)
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'bg-[#181d26] border-slate-700 text-slate-400'
                }`}
              >
                坤道 (女修)
              </button>
            </div>
          </div>
        </div>

        {/* Destiny Traits Roll Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              先天氣運（三項必備）
              <span className="text-slate-500 font-normal">· 點擊鎖頭可鎖定</span>
            </span>

            <button
              type="button"
              onClick={rollTraits}
              disabled={isRolling || slots.every((s) => s.locked)}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-amber-100 font-bold text-xs rounded-lg border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              🎲 逆天洗練 (重骰)
            </button>
          </div>

          <div className="space-y-2.5">
            {slots.map((slot, index) => {
              const { trait, locked } = slot;
              const borderClass =
                trait.rarity === 'red'
                  ? 'border-rose-500/80 bg-gradient-to-r from-rose-950/40 via-[#181d26] to-[#181d26] shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : trait.rarity === 'orange'
                  ? 'border-amber-500/80 bg-gradient-to-r from-amber-950/30 via-[#181d26] to-[#181d26]'
                  : trait.rarity === 'purple'
                  ? 'border-purple-500/80 bg-gradient-to-r from-purple-950/30 via-[#181d26] to-[#181d26]'
                  : 'border-blue-500/80 bg-gradient-to-r from-blue-950/20 via-[#181d26] to-[#181d26]';

              const badgeColor =
                trait.rarity === 'red'
                  ? 'bg-rose-500 text-rose-950 font-black'
                  : trait.rarity === 'orange'
                  ? 'bg-amber-500 text-amber-950 font-black'
                  : trait.rarity === 'purple'
                  ? 'bg-purple-400 text-purple-950 font-bold'
                  : 'bg-blue-400 text-blue-950 font-bold';

              const rarityLabel =
                trait.rarity === 'red'
                  ? '神級紅光'
                  : trait.rarity === 'orange'
                  ? '傳奇金光'
                  : trait.rarity === 'purple'
                  ? '靈動紫光'
                  : '凡骨青光';

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${borderClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded tracking-wider uppercase ${badgeColor}`}>
                      {rarityLabel}
                    </span>
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{trait.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{trait.desc}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleLock(index)}
                    title={locked ? '已鎖定，洗練時不替換' : '點擊鎖定此氣運'}
                    className={`p-2 rounded-md border text-xs transition-colors cursor-pointer ${
                      locked
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#1e2430] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {locked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full md:w-auto min-w-64 py-3 px-8 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-extrabold text-base tracking-widest rounded-lg border border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] transition-all cursor-pointer"
          >
            踏入仙途 (開始遊戲)
          </button>
        </div>
      </div>
    </div>
  );
};
