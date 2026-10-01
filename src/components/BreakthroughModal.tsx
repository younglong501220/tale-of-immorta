import React, { useState } from 'react';
import { Destiny, Item, Player, Realm } from '../types/game';
import { ALL_DESTINIES, REALMS } from '../data/gameData';
import { sound } from '../utils/audio';
import { Zap, AlertTriangle, ShieldCheck, CheckCircle2, Sparkles, X } from 'lucide-react';

interface Props {
  player: Player;
  onClose: () => void;
  onBreakthroughSuccess: (newRealmIdx: number, chosenDestiny: Destiny, consumedMat: string | null) => void;
  onTribulationDefeat: () => void;
}

export const BreakthroughModal: React.FC<Props> = ({
  player,
  onClose,
  onBreakthroughSuccess,
  onTribulationDefeat,
}) => {
  const currentRealm: Realm = REALMS[player.realmIdx];
  const nextRealm: Realm | undefined = REALMS[player.realmIdx + 1];

  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [stage, setStage] = useState<'inspect' | 'pick_destiny'>('inspect');
  const [offeredDestinies, setOfferedDestinies] = useState<Destiny[]>([]);

  if (!nextRealm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#141820] border-2 border-amber-500 rounded-xl p-6 text-center max-w-md text-slate-200">
          <h2 className="text-xl font-bold text-amber-300 mb-3">👑 已登仙境，大道無極</h2>
          <p className="text-sm text-slate-400 mb-6">你已參透鴻蒙造化，羽化登仙，超脫六道輪迴，為八荒當世至尊！</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg cursor-pointer"
          >
            返回凡塵
          </button>
        </div>
      </div>
    );
  }

  // Check requirements
  const isExpReady = player.exp >= currentRealm.maxExp;
  const matName = nextRealm.matRequired;
  const hasMaterial = !matName || player.inventory.some((i: Item) => i.name === matName);

  // Damage calculation
  let tribulationDmg = nextRealm.tribulationDamage;
  if (player.traits.some((t) => t.id === 't_thunder_born')) {
    tribulationDmg = Math.floor(tribulationDmg * 0.5);
  }

  const handleStartBreakthrough = () => {
    if (!isExpReady || !hasMaterial) return;

    sound.playThunder();
    setIsStriking(true);

    setTimeout(() => {
      setIsStriking(false);

      // Check survival
      if (player.hp <= tribulationDmg) {
        onTribulationDefeat();
        return;
      }

      // Survive and pick destiny
      sound.playBreakthrough();
      const existingIds = new Set(player.destinies.map((d) => d.id));
      const pool = ALL_DESTINIES.filter((d) => !existingIds.has(d.id));
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setOfferedDestinies(shuffled.slice(0, 3));
      setStage('pick_destiny');
    }, 1100);
  };

  const handleSelectDestiny = (destiny: Destiny) => {
    sound.playDing();
    onBreakthroughSuccess(player.realmIdx + 1, destiny, matName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl bg-[#141820] border-2 border-amber-600/80 rounded-xl p-6 shadow-2xl text-slate-200 transition-all ${
          isStriking ? 'animate-[pulse_0.15s_infinite] border-cyan-400 shadow-[0_0_80px_rgba(6,182,212,0.8)]' : ''
        }`}
      >
        {/* Thunder Flash Overlay */}
        {isStriking && (
          <div className="absolute inset-0 bg-cyan-200/30 pointer-events-none rounded-xl flex items-center justify-center">
            <span className="text-4xl font-extrabold text-cyan-200 drop-shadow-[0_0_20px_#fff]">
              ⚡ 九天玄雷，劫滅眾生！ ⚡
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isStriking}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {stage === 'inspect' ? (
          <div>
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
                {currentRealm.name} ➔ {nextRealm.name}
              </span>
              <h2 className="text-2xl font-extrabold text-amber-300 mt-1">
                ⚡ 衝擊大道境界 · 渡天道雷劫 ⚡
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">{nextRealm.desc}</p>
            </div>

            {/* Tribulation Warning */}
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-lg p-3.5 mb-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-300">
                <span className="font-bold text-rose-300">九天雷劫威能：</span>
                突破將引下天道神雷轟頂，預估造成約{' '}
                <span className="font-bold font-mono text-rose-400 text-sm">{tribulationDmg}</span> 點氣血衝擊！
                若氣血不足將直接神形俱滅、身死道消！
                {player.hp <= tribulationDmg && (
                  <div className="mt-1 text-rose-400 font-bold underline">
                    ⚠️ 當前氣血 ({player.hp}) 低於雷劫傷害，強行渡劫必死！請先服用丹藥或閉關回滿氣血！
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Box */}
            <div className="bg-[#191e28] border border-[#2a3243] rounded-lg p-4 space-y-3 mb-6 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">當前修為圓滿要求：</span>
                <span className="font-mono font-semibold">
                  <span className={isExpReady ? 'text-emerald-400' : 'text-rose-400'}>
                    {player.exp}
                  </span>{' '}
                  / {currentRealm.maxExp}
                  {isExpReady ? ' (已圓滿 ✓)' : ' (修為不足 ✕)'}
                </span>
              </div>

              {matName && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">所需極品天地靈物：</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    {hasMaterial ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {matName} (已齊備)
                      </span>
                    ) : (
                      <span className="text-rose-400">
                        {matName} (背包缺少，需歷練探秘或拍賣奪取)
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">突破後壽元大幅延長至：</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {nextRealm.lifespan} 歲 (+{nextRealm.lifespan - currentRealm.lifespan} 年)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-[#1f2633] hover:bg-[#283243] text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                暫時隱忍，鞏固根基
              </button>
              <button
                onClick={handleStartBreakthrough}
                disabled={!isExpReady || !hasMaterial || isStriking}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-500 hover:to-rose-500 disabled:opacity-40 text-amber-100 font-bold text-xs rounded-lg border border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                {isStriking ? '雷劫降世中...' : '⚡ 引九天神雷 · 逆天破境！'}
              </button>
            </div>
          </div>
        ) : (
          /* Pick Destiny Screen */
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 天道垂青 · 氣運造化 <Sparkles className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-2xl font-extrabold text-amber-300 mt-1">
                🌟 突破圓滿 · 選擇一項「逆天改命」
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                恭喜渡劫成功晉入【{nextRealm.name}】！天道賜福，請從下列大道真意中擇一刻入神魂：
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {offeredDestinies.map((destiny) => (
                <div
                  key={destiny.id}
                  onClick={() => handleSelectDestiny(destiny)}
                  className="group relative p-4 rounded-xl border border-amber-600/50 bg-gradient-to-r from-[#1d222e] via-[#1a1f2b] to-[#181d26] hover:border-amber-400 hover:from-[#242b3b] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-amber-300 text-sm group-hover:text-amber-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      {destiny.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-semibold uppercase">
                      神級改命
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{destiny.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-slate-400">
              選擇後該逆天改命被動將永久生效，伴隨你的漫漫仙途。
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
