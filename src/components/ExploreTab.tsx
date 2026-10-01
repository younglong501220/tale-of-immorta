import React from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { Compass, Sparkles, Skull, Mountain, Zap, Flame, Trees, Footprints } from 'lucide-react';

interface Props {
  player: Player;
  onExploreRegion: (regionKey: 'forest' | 'leize' | 'huafeng' | 'forbidden') => void;
  onTriggerRandomEvent: () => void;
}

export const ExploreTab: React.FC<Props> = ({
  player,
  onExploreRegion,
  onTriggerRandomEvent,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner with Chinese ink wash artwork */}
      <div className="relative rounded-xl overflow-hidden border border-amber-900/40 shadow-2xl h-44 md:h-52 flex flex-col justify-end p-6 bg-gradient-to-t from-[#0e1117] via-[#0e1117]/80 to-transparent">
        <img
          src="/src/assets/images/xianxia_hero_bg_1790696968009.jpg"
          alt="山海經大荒世界"
          className="absolute inset-0 w-full h-full object-cover object-center -z-10 brightness-60 contrast-125"
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-2">
            <Compass className="w-3.5 h-3.5" /> 山海經·大荒八州
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-amber-200 tracking-wide">
            山海經浩瀚大荒 · 機緣與凶險並存
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            茫茫大荒，妖獸橫行，古修洞府隨處掩藏。深入險境歷練可採集突破靈物，亦可能遭遇強敵截殺！
          </p>
        </div>
      </div>

      {/* 4 Major Regions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Mountain className="w-4 h-4 text-amber-400" /> 八荒歷練秘境分佈
          </h3>
          <span className="text-xs text-slate-400">歷練將推移歲月並積累修為</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. 永寧州·十萬大山 */}
          <div className="bg-[#141822] border border-[#273042] hover:border-emerald-600/60 rounded-xl p-4.5 flex flex-col justify-between transition-all group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Trees className="w-4 h-4" /> 🌲 永寧州·十萬大山外圍
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  適合：練氣 / 築基
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                妖獸聚集之蒼茫林海，盛產低階靈藥與築基之氣，危險度較低，適合初踏仙途者磨礪劍意。
              </p>
            </div>
            <button
              onClick={() => {
                sound.playDing();
                onExploreRegion('forest');
              }}
              className="w-full py-2.5 px-4 bg-[#1b2230] hover:bg-emerald-900/60 border border-emerald-700/50 hover:border-emerald-500 text-emerald-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              進入歷練 (消耗 1 個月)
            </button>
          </div>

          {/* 2. 永寧州·雷澤秘境 */}
          <div className="bg-[#141822] border border-[#273042] hover:border-purple-600/60 rounded-xl p-4.5 flex flex-col justify-between transition-all group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-400 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> ⚡ 永寧州·雷澤遠古秘境
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  適合：金丹 / 具靈
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                常年雷霆漫天環繞，盛產金丹混沌靈珠與具靈仙芝，亦有九天雷狼、驚雷神雕等悍妖鎮守！
              </p>
            </div>
            <button
              onClick={() => {
                sound.playDing();
                onExploreRegion('leize');
              }}
              className="w-full py-2.5 px-4 bg-[#1b2230] hover:bg-purple-900/60 border border-purple-700/50 hover:border-purple-500 text-purple-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              探索雷澤 (消耗 3 個月)
            </button>
          </div>

          {/* 3. 華封州·百萬大山 */}
          <div className="bg-[#141822] border border-[#273042] hover:border-amber-600/60 rounded-xl p-4.5 flex flex-col justify-between transition-all group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <Mountain className="w-4 h-4" /> 🏜️ 華封州·百萬大山古蹟
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  適合：具靈 / 元嬰
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                大荒深處天險屏障，棲息著陸吾、鳴蛇等遠古凶獸，更有上古修士坐化遺留的元嬰天髓！
              </p>
            </div>
            <button
              onClick={() => {
                sound.playDing();
                onExploreRegion('huafeng');
              }}
              className="w-full py-2.5 px-4 bg-[#1b2230] hover:bg-amber-900/60 border border-amber-700/50 hover:border-amber-500 text-amber-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              深入大荒 (消耗 6 個月)
            </button>
          </div>

          {/* 4. 雲陌州·荒古不歸禁地 */}
          <div className="bg-[#141822] border border-[#273042] hover:border-rose-600/60 rounded-xl p-4.5 flex flex-col justify-between transition-all group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> 🔥 雲陌州·荒古不歸禁地
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  適合：化神 / 登仙
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                大能神魔喋血之地，充斥無盡煞氣。深藏化神真元神魂與鴻蒙道果，九死一生，極度兇險！
              </p>
            </div>
            <button
              onClick={() => {
                sound.playDing();
                onExploreRegion('forbidden');
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border border-rose-600 text-rose-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              九死一生 · 探禁地 (消耗 1 年)
            </button>
          </div>
        </div>
      </div>

      {/* Random Roam Section */}
      <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-amber-400" /> 漫無目的遊歷大荒 (隨機仙家奇遇)
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              隨意行走於山川湖海之間。可能遇見遊方煉丹師、古修遺留洞府、靈泉洗髓，或與攔路修士爆發衝突！
            </p>
          </div>
          <button
            onClick={() => {
              sound.playDice();
              onTriggerRandomEvent();
            }}
            className="py-2.5 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            🎲 漫步大荒 (觸發隨機奇遇)
          </button>
        </div>
      </div>
    </div>
  );
};
