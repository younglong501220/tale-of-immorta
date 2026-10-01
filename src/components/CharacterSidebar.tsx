import React, { useState, useMemo } from 'react';
import { Player, Realm } from '../types/game';
import { REALMS } from '../data/gameData';
import {
  Flame,
  Shield,
  Heart,
  Zap,
  Sparkles,
  Award,
  Skull,
  Coins,
  BookOpen,
  TrendingUp,
  Maximize2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { BreakthroughCurveModal } from './BreakthroughCurveModal';

interface Props {
  player: Player;
  onOpenBreakthrough: () => void;
}

export const CharacterSidebar: React.FC<Props> = ({ player, onOpenBreakthrough }) => {
  const [isCurveModalOpen, setIsCurveModalOpen] = useState(false);

  const currentRealm: Realm = REALMS[player.realmIdx] || REALMS[0];
  const nextRealm: Realm | undefined = REALMS[player.realmIdx + 1];
  const isExpFull = player.exp >= currentRealm.maxExp;
  const isNearDeath = player.age >= player.maxAge - 15;

  const hpPercent = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));
  const expPercent = Math.min(100, Math.max(0, (player.exp / currentRealm.maxExp) * 100));
  const expNeeded = Math.max(0, currentRealm.maxExp - player.exp);

  // 累計歷史總修為 (Total historical cultivation accumulated)
  const totalHistoricalExp = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < player.realmIdx; i++) {
      sum += REALMS[i].maxExp;
    }
    sum += player.exp;
    return sum;
  }, [player.realmIdx, player.exp]);

  // Mini Curve Chart Data for Sidebar: 歷史修為增長趨勢 vs 諸境界突破靈氣要求
  const miniCurveData = useMemo(() => {
    return REALMS.map((r) => {
      let playerExpAtRealm: number | null = null;
      if (r.index < player.realmIdx) {
        playerExpAtRealm = r.maxExp;
      } else if (r.index === player.realmIdx) {
        playerExpAtRealm = player.exp;
      } else {
        playerExpAtRealm = null;
      }

      return {
        name: r.name,
        shortName: r.name.replace('境', ''),
        req: r.maxExp,
        playerExp: playerExpAtRealm,
        isCurrent: r.index === player.realmIdx,
        isPast: r.index < player.realmIdx,
      };
    });
  }, [player.realmIdx, player.exp]);

  return (
    <aside className="w-80 shrink-0 bg-[#12151b] border-r border-[#262c38] flex flex-col h-full overflow-y-auto p-4 gap-4 text-slate-200 shadow-2xl">
      {/* Header Profile Box */}
      <div className="relative rounded-lg p-3 bg-gradient-to-b from-[#1b212c] to-[#141820] border border-amber-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪷</span>
            <div>
              <h2 className="font-bold text-amber-300 text-lg tracking-wide leading-tight">
                {player.name}
              </h2>
              <span className="text-xs text-slate-400">
                {player.title || '八荒散修'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
              {currentRealm.name}
            </span>
          </div>
        </div>

        {/* Lifespan */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>壽元歲數</span>
          <span className={`font-mono ${isNearDeath ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}`}>
            {player.age} / {player.maxAge} 歲 {isNearDeath && '(大限將至!)'}
          </span>
        </div>
      </div>

      {/* HP & EXP Bars */}
      <div className="space-y-3 bg-[#171b23] p-3 rounded-lg border border-[#232936]">
        {/* HP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3.5 h-3.5" /> 氣血真元
            </span>
            <span className="font-mono text-slate-300">
              {player.hp} / {player.maxHp}
            </span>
          </div>
          <div className="h-3 w-full bg-[#0d0f14] rounded-full overflow-hidden border border-rose-950/50 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-red-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* EXP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" /> 修為積累
            </span>
            <span className="font-mono text-slate-300">
              {player.exp} / {currentRealm.maxExp} ({Math.floor(expPercent)}%)
            </span>
          </div>
          <div className="h-3 w-full bg-[#0d0f14] rounded-full overflow-hidden border border-cyan-950/50 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isExpFull
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-400'
              }`}
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#171b23] p-2.5 rounded border border-[#232936] flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> 攻擊力
          </span>
          <span className="font-mono font-semibold text-amber-300 text-sm">{player.atk}</span>
        </div>

        <div className="bg-[#171b23] p-2.5 rounded border border-[#232936] flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> 防禦力
          </span>
          <span className="font-mono font-semibold text-cyan-300 text-sm">{player.def}</span>
        </div>

        <div className="bg-[#171b23] p-2.5 rounded border border-[#232936] flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 悟性值
          </span>
          <span className="font-mono font-semibold text-purple-300 text-sm">{player.int}</span>
        </div>

        <div className="bg-[#171b23] p-2.5 rounded border border-[#232936] flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> 氣運值
          </span>
          <span className="font-mono font-semibold text-yellow-300 text-sm">{player.luk}</span>
        </div>

        <div className="col-span-2 bg-[#171b23] p-2.5 rounded border border-[#232936] flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Coins className="w-4 h-4 text-amber-400" /> 靈石資產
          </span>
          <span className="font-mono font-bold text-amber-300 text-base">
            {player.gold.toLocaleString()} <span className="text-xs text-amber-500/80 font-normal">靈石</span>
          </span>
        </div>
      </div>

      {/* Sect & Alliance & Moral Stand */}
      <div className="bg-[#171b23] p-2.5 rounded border border-[#232936] text-xs space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">當前所屬宗門:</span>
          <span className="font-semibold text-amber-400">{player.sect ? player.sect.name : '散修遊歷'}</span>
        </div>
        {player.sect && (
          <div className="flex justify-between items-center text-slate-300">
            <span>宗門身份:</span>
            <span className="text-cyan-300">{player.sect.rank}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">跨服仙盟:</span>
          <span className="font-semibold text-purple-300 flex items-center gap-1">
            {player.alliance ? `${player.alliance.crest} ${player.alliance.name}` : '未結同盟'}
          </span>
        </div>
        {player.alliance && (
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>仙盟職務:</span>
            <span className="text-amber-300">{player.alliance.role}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1">
            <Skull className="w-3.5 h-3.5 text-rose-400" /> 斬妖/滅敵數:
          </span>
          <span className="font-mono text-slate-200">{player.killCount} 人/獸</span>
        </div>
      </div>

      {/* Traits & Destinies Badges */}
      <div className="bg-[#171b23] p-3 rounded-lg border border-[#232936] flex-1 flex flex-col min-h-36">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>先天氣運 & 逆天改命 ({player.traits.length + player.destinies.length})</span>
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-48 pr-1">
          {player.traits.map((t) => {
            const colorClass =
              t.rarity === 'red'
                ? 'bg-rose-950/60 text-rose-300 border-rose-600/70 shadow-[0_0_6px_rgba(244,63,94,0.3)]'
                : t.rarity === 'orange'
                ? 'bg-amber-950/60 text-amber-300 border-amber-600/70'
                : t.rarity === 'purple'
                ? 'bg-purple-950/60 text-purple-300 border-purple-600/70'
                : 'bg-blue-950/60 text-blue-300 border-blue-600/70';

            return (
              <span
                key={t.id}
                title={t.desc}
                className={`text-xs px-2 py-0.5 rounded border font-medium cursor-help transition-all hover:scale-105 ${colorClass}`}
              >
                {t.name}
              </span>
            );
          })}

          {player.destinies.map((d) => (
            <span
              key={d.id}
              title={d.desc}
              className="text-xs px-2 py-0.5 rounded border border-rose-500 bg-gradient-to-r from-rose-950/80 to-amber-950/80 text-amber-200 font-semibold cursor-help shadow-[0_0_8px_rgba(244,63,94,0.4)]"
            >
              ★ {d.name.replace('逆天改命·', '')}
            </span>
          ))}

          {player.traits.length === 0 && player.destinies.length === 0 && (
            <span className="text-xs text-slate-500 italic">暫無氣運加持</span>
          )}
        </div>
      </div>

      {/* 角色側邊欄位下方：修為境界突破曲線圖 (Recharts) */}
      <div className="bg-gradient-to-b from-[#181d26] to-[#12151c] p-3 rounded-lg border border-amber-900/50 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> 修為境界突破曲線
          </span>
          <button
            onClick={() => setIsCurveModalOpen(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer hover:underline bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40"
          >
            <span>展開天機圖</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Legend indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-1 bg-amber-400 rounded-sm"></span>
              <span className="text-amber-300/90 font-medium">靈氣要求</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-1 bg-cyan-400 rounded-sm"></span>
              <span className="text-cyan-300/90 font-medium">歷史修為</span>
            </span>
          </div>
          <span className="font-mono text-cyan-300 font-bold">
            {currentRealm.name} ({Math.floor(expPercent)}%)
          </span>
        </div>

        {/* Recharts Curve Preview with Dual Series */}
        <div
          onClick={() => setIsCurveModalOpen(true)}
          className="h-24 w-full bg-[#0b0e14] rounded-lg border border-slate-800 p-1 cursor-pointer hover:border-amber-500/70 transition-all relative group"
          title="點擊展開查看諸天境界靈氣突破曲線與歷史趨勢"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniCurveData} margin={{ top: 8, right: 6, left: -25, bottom: -10 }}>
              <defs>
                <linearGradient id="miniReqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="shortName" hide />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#121622] border border-amber-500/80 p-2 rounded-lg text-[10px] text-slate-200 font-mono shadow-xl space-y-1">
                        <div className="text-amber-300 font-bold border-b border-slate-700/80 pb-0.5 flex justify-between gap-2">
                          <span>{d.name}</span>
                          <span className={d.isCurrent ? 'text-amber-400' : d.isPast ? 'text-emerald-400' : 'text-slate-500'}>
                            {d.isCurrent ? '當前境界' : d.isPast ? '已破境' : '未達'}
                          </span>
                        </div>
                        <div className="text-amber-300">
                          ⚡ 靈氣要求: {d.req.toLocaleString()} 點
                        </div>
                        {d.playerExp !== null ? (
                          <div className="text-cyan-300 font-bold">
                            💧 {d.isCurrent ? `當前真元: ${d.playerExp.toLocaleString()} 點 (${Math.floor(expPercent)}%)` : `修為達成: ${d.playerExp.toLocaleString()} 點`}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic">尚未悟及此境</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="req"
                name="靈氣要求"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#miniReqGrad)"
              />
              <Line
                type="monotone"
                dataKey="playerExp"
                name="歷史修為"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 1 }}
                connectNulls={false}
              />
              <ReferenceDot
                x={currentRealm.name.replace('境', '')}
                y={player.exp}
                r={4.5}
                fill="#22d3ee"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Progression summary info */}
        <div className="space-y-1 pt-1 text-[11px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>當前破境要求：</span>
            <span className="font-mono font-semibold text-amber-300">
              {currentRealm.maxExp.toLocaleString()} 點靈氣
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>尚需修為真元：</span>
            <span className={`font-mono font-bold ${expNeeded === 0 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {expNeeded === 0 ? '✨ 靈氣圓滿可渡劫' : `${expNeeded.toLocaleString()} 點`}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>歷史總修為累計：</span>
            <span className="font-mono text-purple-300">
              {totalHistoricalExp.toLocaleString()} 點
            </span>
          </div>
        </div>
      </div>

      {/* Breakthrough CTA */}
      <div className="mt-auto pt-2">
        <button
          onClick={onOpenBreakthrough}
          disabled={!nextRealm}
          className={`w-full py-3 px-4 rounded-lg font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
            !nextRealm
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : isExpFull
              ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-amber-100 border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] hover:scale-[1.02] active:scale-[0.98] animate-pulse cursor-pointer'
              : 'bg-gradient-to-r from-slate-800 to-[#1e2430] text-slate-300 border border-slate-700/80 hover:border-amber-500/50 hover:text-amber-300 cursor-pointer'
          }`}
        >
          <Zap className={`w-4 h-4 ${isExpFull ? 'text-yellow-300 animate-bounce' : 'text-slate-400'}`} />
          {nextRealm ? (isExpFull ? '⚡ 境界圓滿 · 引動雷劫' : '⚡ 查驗突破條件') : '👑 已至登仙巔峰'}
        </button>
      </div>

      {/* Breakthrough Curve Modal */}
      {isCurveModalOpen && (
        <BreakthroughCurveModal
          player={player}
          onClose={() => setIsCurveModalOpen(false)}
          onOpenBreakthrough={onOpenBreakthrough}
        />
      )}
    </aside>
  );
};
