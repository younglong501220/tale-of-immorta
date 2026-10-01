import React from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { Hourglass, Sparkles, Heart, AlertOctagon, Flame } from 'lucide-react';

interface Props {
  player: Player;
  onMeditate: (years: number) => void;
}

export const MeditateTab: React.FC<Props> = ({ player, onMeditate }) => {
  const remainingYears = player.maxAge - player.age;

  const spiritMult = 1 + (player.alliance?.spiritArrayLevel || 0) * 0.15;
  const scriptureLvl = player.unlockedScriptures?.['scripture_meditate_exp'] || 0;
  const scriptureExpMult = 1 + scriptureLvl * 0.25;
  const totalExpMult = spiritMult * scriptureExpMult;

  return (
    <div className="space-y-6">
      {/* Seclusion Artwork Hero */}
      <div className="relative rounded-xl overflow-hidden border border-amber-900/40 shadow-2xl h-44 flex flex-col justify-end p-6 bg-gradient-to-t from-[#0e1117] via-[#0e1117]/80 to-transparent">
        <img
          src="/src/assets/images/xianxia_tribulation_art_1790696983702.jpg"
          alt="洞府靜修"
          className="absolute inset-0 w-full h-full object-cover object-center -z-10 brightness-50 contrast-125"
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-950/80 border border-purple-600/70 text-purple-300 mb-1">
            <Hourglass className="w-3.5 h-3.5" /> 洞府靈脈吐納
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-200">
            修真無歲月 · 坐看世上已千年
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            於靈氣匯聚之洞府閉關吐納，可安全、平穩地暴漲修為並完全治癒內外傷勢。但修仙者壽元有數，切記在大限到來前突破桎梏！
          </p>
        </div>
      </div>

      {/* Alliance Scripture & Spirit Array Buffs Banner */}
      {(scriptureLvl > 0 || (player.alliance?.spiritArrayLevel || 0) > 0) && (
        <div className="bg-gradient-to-r from-purple-950/60 via-[#181f2b] to-[#141822] border border-purple-500/50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-purple-300">仙盟玄功秘法加持生效中：</span>
              {scriptureLvl > 0 && (
                <span className="text-emerald-400 font-bold ml-1.5">
                  📜 藏經閣《太虛吐納真經》(第 {scriptureLvl} 重 +{scriptureLvl * 25}%)
                </span>
              )}
              {(player.alliance?.spiritArrayLevel || 0) > 0 && (
                <span className="text-amber-400 font-bold ml-2">
                  ⚡ 聚靈大陣(Lv.{player.alliance?.spiritArrayLevel} +{(player.alliance?.spiritArrayLevel || 0) * 15}%)
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-mono font-extrabold text-cyan-300 bg-purple-900/50 px-2.5 py-0.5 rounded border border-purple-700/50 whitespace-nowrap self-start sm:self-auto">
            總修為倍率 x{totalExpMult.toFixed(2)}
          </span>
        </div>
      )}

      {/* Longevity Warning Alert */}
      <div className="bg-[#141822] border border-[#273042] rounded-xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <AlertOctagon className={`w-5 h-5 ${remainingYears <= 15 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <div>
            <span className="text-xs text-slate-400 block">當前壽元結算：</span>
            <span className="text-sm font-bold text-slate-200">
              享年 <span className="font-mono text-amber-300">{player.age}</span> 歲 / 上限{' '}
              <span className="font-mono text-slate-300">{player.maxAge}</span> 歲 (剩餘{' '}
              <span className={`font-mono ${remainingYears <= 15 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                {remainingYears}
              </span>{' '}
              年陽壽)
            </span>
          </div>
        </div>
        {remainingYears <= 15 && (
          <span className="text-xs px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold animate-pulse">
            ⚠️ 壽元垂危，請謹慎閉關百年！
          </span>
        )}
      </div>

      {/* Meditation Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1 Year */}
        <div className="bg-[#141822] border border-[#273042] hover:border-cyan-600/60 rounded-xl p-5 flex flex-col justify-between shadow-lg transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-cyan-300 text-base">閉關 1 年 (靜心小憩)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                低風險
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              引導洞府靈氣周天運轉。修復氣血暗疾，平穩獲得修為。
            </p>
            <div className="bg-[#0e1117] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span>消耗壽元：</span>
                <span className="font-mono text-slate-200">1 年</span>
              </div>
              <div className="flex justify-between">
                <span>修為獲取：</span>
                <span className="font-mono text-emerald-400 font-bold">
                  +{Math.floor(35 * (1 + player.int / 100) * totalExpMult)} 點
                </span>
              </div>
              <div className="flex justify-between">
                <span>氣血狀態：</span>
                <span className="text-emerald-400">瞬間完全治癒</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playDing();
              onMeditate(1);
            }}
            className="w-full py-2.5 px-4 bg-[#1b2230] hover:bg-cyan-900/60 border border-cyan-700/60 text-cyan-200 font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            閉關 1 年 (+修為/回滿氣血)
          </button>
        </div>

        {/* 10 Years */}
        <div className="bg-[#141822] border border-[#273042] hover:border-amber-600/60 rounded-xl p-5 flex flex-col justify-between shadow-lg transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-amber-300 text-base">閉關 10 年 (入定頓悟)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                中度推移
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              沉浸於大道真意深處，十載寒暑如白駒過隙。大量積累修為與神念。
            </p>
            <div className="bg-[#0e1117] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span>消耗壽元：</span>
                <span className="font-mono text-amber-300">10 年</span>
              </div>
              <div className="flex justify-between">
                <span>修為獲取：</span>
                <span className="font-mono text-emerald-400 font-bold">
                  +{Math.floor(400 * (1 + player.int / 100) * totalExpMult)} 點
                </span>
              </div>
              <div className="flex justify-between">
                <span>氣血狀態：</span>
                <span className="text-emerald-400">瞬間完全治癒</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playDing();
              onMeditate(10);
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-lg border border-amber-300 shadow-sm transition-all cursor-pointer"
          >
            閉關 10 年 (+大量修為)
          </button>
        </div>

        {/* 100 Years */}
        <div className="bg-[#141822] border border-[#273042] hover:border-rose-600/60 rounded-xl p-5 flex flex-col justify-between shadow-lg transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-rose-400 text-base">閉關 100 年 (生死玄關)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                逆天一搏
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              石破天驚，神遊太虛整整百年！若當前壽元不足百年，閉關中將直接壽終正寢坐化！
            </p>
            <div className="bg-[#0e1117] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span>消耗壽元：</span>
                <span className="font-mono text-rose-400 font-bold">100 年</span>
              </div>
              <div className="flex justify-between">
                <span>修為獲取：</span>
                <span className="font-mono text-yellow-300 font-extrabold">
                  +{Math.floor(4500 * (1 + player.int / 100) * totalExpMult)} 點
                </span>
              </div>
              <div className="flex justify-between">
                <span>生機判定：</span>
                <span className={remainingYears < 100 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {remainingYears < 100 ? '⚠️ 必死道消 (壽元不足)' : '可安全承受'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playDing();
              onMeditate(100);
            }}
            disabled={remainingYears < 100}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-900 to-red-950 hover:from-rose-800 hover:to-red-900 disabled:opacity-40 border border-rose-600 text-rose-200 font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-md"
          >
            🔥 閉關百年 (生死玄關·逆天一搏)
          </button>
        </div>
      </div>
    </div>
  );
};
