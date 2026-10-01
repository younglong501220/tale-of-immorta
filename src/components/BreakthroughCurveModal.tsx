import React, { useState, useMemo } from 'react';
import { Player, Realm } from '../types/game';
import { REALMS } from '../data/gameData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  Zap,
  Heart,
  Flame,
  Shield,
  X,
  Hourglass,
  Layers,
  Award,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  player: Player;
  onClose: () => void;
  onOpenBreakthrough?: () => void;
}

export const BreakthroughCurveModal: React.FC<Props> = ({
  player,
  onClose,
  onOpenBreakthrough,
}) => {
  const [viewMode, setViewMode] = useState<'realm_curve' | 'historical_trend'>('realm_curve');

  const currentRealm: Realm = REALMS[player.realmIdx] || REALMS[0];
  const nextRealm: Realm | undefined = REALMS[player.realmIdx + 1];
  const isExpFull = player.exp >= currentRealm.maxExp;
  const expPercent = Math.min(100, Math.max(0, (player.exp / currentRealm.maxExp) * 100));
  const expNeeded = Math.max(0, currentRealm.maxExp - player.exp);

  // 1. Data for Realm Threshold Escalation Curve (諸境界突破靈氣要求階梯曲線)
  const realmCurveData = useMemo(() => {
    let accumulatedThreshold = 0;

    return REALMS.map((r) => {
      accumulatedThreshold += r.maxExp;
      const isPast = r.index < player.realmIdx;
      const isCurrent = r.index === player.realmIdx;
      const isFuture = r.index > player.realmIdx;

      // Player's actual accumulated exp at this milestone
      let playerActualVal: number | null = null;
      if (isPast) {
        playerActualVal = r.maxExp;
      } else if (isCurrent) {
        playerActualVal = player.exp;
      }

      return {
        name: r.name,
        shortName: r.name.replace('境', ''),
        index: r.index,
        realmIndex: r.index + 1,
        // Individual realm requirement
        realmRequirement: r.maxExp,
        // Cumulative requirement
        cumulativeRequirement: accumulatedThreshold,
        // Player's progress on this tier
        playerCurrentExp: playerActualVal,
        // Status text
        status: isPast ? '已圓滿破境' : isCurrent ? '當前參悟中' : '未達天門',
        hp: r.maxHp,
        atk: r.atk,
        def: r.def,
        lifespan: r.lifespan,
        tribulationDamage: r.tribulationDamage,
        matRequired: r.matRequired || '無',
      };
    });
  }, [player.realmIdx, player.exp]);

  // 2. Data for Historical Progression Timeline (歷史修為增長趨勢)
  const historicalData = useMemo(() => {
    // If player has tracked history, use it; otherwise generate plausible progression checkpoints based on current age & realm
    const startAge = 16;
    const currentAge = Math.max(startAge, player.age);
    const totalCheckpoints = Math.max(6, Math.min(12, currentAge - startAge + 1));

    const points = [];
    const ageStep = Math.max(1, (currentAge - startAge) / (totalCheckpoints - 1));

    // Calculate total past exp
    let pastRealmExp = 0;
    for (let i = 0; i < player.realmIdx; i++) {
      pastRealmExp += REALMS[i].maxExp;
    }
    const currentTotalExp = pastRealmExp + player.exp;

    for (let i = 0; i < totalCheckpoints; i++) {
      const age = Math.round(startAge + i * ageStep);
      const ratio = i / (totalCheckpoints - 1);
      // Exponential growth curve mimicking cultivation breakthrough leaps
      const progressFactor = Math.pow(ratio, 1.8);
      const estimatedExp = Math.round(currentTotalExp * progressFactor);

      // Determine realm at that estimated point
      let checkExp = estimatedExp;
      let rIdx = 0;
      for (let r = 0; r < REALMS.length; r++) {
        if (checkExp > REALMS[r].maxExp && r < player.realmIdx) {
          checkExp -= REALMS[r].maxExp;
          rIdx = r + 1;
        } else {
          break;
        }
      }

      points.push({
        ageLabel: `${age} 歲`,
        age,
        totalExp: i === totalCheckpoints - 1 ? currentTotalExp : estimatedExp,
        realmName: REALMS[rIdx]?.name || '練氣境',
        currentReq: currentRealm.maxExp,
        isCurrent: i === totalCheckpoints - 1,
      });
    }

    return points;
  }, [player.age, player.realmIdx, player.exp, currentRealm.maxExp]);

  // Estimated meditation sessions needed
  const estMeditations = useMemo(() => {
    const spiritMult = 1 + (player.alliance?.spiritArrayLevel || 0) * 0.15;
    const scriptureLvl = player.unlockedScriptures?.['scripture_meditate_exp'] || 0;
    const scriptureMult = 1 + scriptureLvl * 0.25;
    const totalMult = spiritMult * scriptureMult;
    const expPer10Years = Math.floor(400 * (1 + player.int / 100) * totalMult);

    if (expNeeded <= 0) return 0;
    return Math.max(1, Math.ceil(expNeeded / Math.max(1, expPer10Years)));
  }, [player.int, player.alliance, player.unlockedScriptures, expNeeded]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#121622] border-2 border-amber-600/70 rounded-2xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400 flex items-center justify-center shadow-lg shrink-0">
              <TrendingUp className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-950/80 text-amber-300 border border-amber-600">
                  天道推演 · 命盤軌跡
                </span>
                <span className="text-xs text-slate-400">
                  當前境界：<strong className="text-amber-300">{currentRealm.name}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-amber-100 tracking-wide mt-0.5">
                修為境界突破曲線圖 (Cultivation Breakthrough Curve)
              </h2>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-[#0e1117] p-1 border border-slate-800 self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                sound.playDing();
                setViewMode('realm_curve');
              }}
              className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'realm_curve'
                  ? 'bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 諸境界靈氣要求階梯
            </button>
            <button
              onClick={() => {
                sound.playDing();
                setViewMode('historical_trend');
              }}
              className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'historical_trend'
                  ? 'bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> 歷史修為增長軌跡
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Current Realm & Progress */}
            <div className="bg-[#171c28] border border-amber-900/60 rounded-xl p-3 shadow-md">
              <span className="text-[10px] text-slate-400 block font-medium">當前修行境界</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base sm:text-lg font-extrabold text-amber-300">
                  {currentRealm.name}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {Math.floor(expPercent)}%
                </span>
              </div>
              <div className="w-full bg-[#0d1017] h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isExpFull
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-300 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                  }`}
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>

            {/* Current Accumulated Exp */}
            <div className="bg-[#171c28] border border-cyan-900/60 rounded-xl p-3 shadow-md">
              <span className="text-[10px] text-slate-400 block font-medium">本境修為積累</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base sm:text-lg font-mono font-extrabold text-cyan-300">
                  {player.exp.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  / {currentRealm.maxExp.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {isExpFull ? '✨ 靈氣圓滿，可渡雷劫' : `尚需 ${expNeeded.toLocaleString()} 點真元`}
              </span>
            </div>

            {/* Next Realm Preview */}
            <div className="bg-[#171c28] border border-purple-900/60 rounded-xl p-3 shadow-md">
              <span className="text-[10px] text-slate-400 block font-medium">叩關突破目標</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base sm:text-lg font-extrabold text-purple-300">
                  {nextRealm ? nextRealm.name : '已臻登仙'}
                </span>
                {nextRealm && (
                  <span className="text-[10px] font-mono text-slate-400">
                    階差 +{nextRealm.maxExp}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">
                {nextRealm?.matRequired ? `需至寶：${nextRealm.matRequired}` : '無須特定靈物'}
              </span>
            </div>

            {/* Estimated Sessions */}
            <div className="bg-[#171c28] border border-emerald-900/60 rounded-xl p-3 shadow-md">
              <span className="text-[10px] text-slate-400 block font-medium">預估破境閉關</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
                  {isExpFull ? '0 次' : `約 ${estMeditations} 次`}
                </span>
                <span className="text-[10px] text-slate-400">以十年為度</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">
                壽元剩餘：{player.maxAge - player.age} 年
              </span>
            </div>
          </div>

          {/* Main Recharts Graph Card */}
          <div className="bg-[#0e1117] border border-[#232936] rounded-xl p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  {viewMode === 'realm_curve'
                    ? '諸天修真境界突破靈氣要求階梯曲線 (Realm Threshold Scale)'
                    : '道途年歲與修為真元歷史增長趨勢 (Historical Exp Growth)'}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="text-slate-300">天道突破要求門檻</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                  <span className="text-slate-300">
                    {viewMode === 'realm_curve' ? '個人當前修為進度' : '累計修為增長'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'realm_curve' ? (
                  <AreaChart
                    data={realmCurveData}
                    margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      {/* Gold gradient for Realm Requirement */}
                      <linearGradient id="realmReqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                      {/* Cyan gradient for Player Exp */}
                      <linearGradient id="playerExpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2633" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(val) =>
                        val >= 10000 ? `${(val / 10000).toFixed(0)}萬` : val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
                      }
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isCur = data.index === player.realmIdx;

                          return (
                            <div className="bg-[#141822]/95 border border-amber-500/80 rounded-lg p-3 text-xs shadow-2xl backdrop-blur-md space-y-1.5 min-w-[200px]">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <span className="font-bold text-amber-300 text-sm">{data.name}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                    data.index < player.realmIdx
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                      : isCur
                                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">突破所需靈氣：</span>
                                <span className="font-mono text-amber-400 font-bold">
                                  {data.realmRequirement.toLocaleString()} 點
                                </span>
                              </div>
                              {isCur && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">當前蓄積真元：</span>
                                  <span className="font-mono text-cyan-300 font-bold">
                                    {player.exp.toLocaleString()} 點 ({Math.floor(expPercent)}%)
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/80">
                                <span className="text-slate-400">破境雷劫傷害：</span>
                                <span className="font-mono text-rose-400 font-bold">
                                  {data.tribulationDamage} 點
                                </span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">壽元天命上限：</span>
                                <span className="font-mono text-emerald-400 font-bold">
                                  {data.lifespan} 歲
                                </span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">核心突破靈物：</span>
                                <span className="text-purple-300 font-medium">{data.matRequired}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Area for Heaven Requirement */}
                    <Area
                      type="monotone"
                      dataKey="realmRequirement"
                      name="天道突破所需靈氣"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#realmReqGrad)"
                    />
                    {/* Area for Player current Exp */}
                    <Area
                      type="monotone"
                      dataKey="playerCurrentExp"
                      name="個人當前修為"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#playerExpGrad)"
                      connectNulls={false}
                    />
                    {/* Reference Dot on current realm */}
                    <ReferenceDot
                      x={currentRealm.name}
                      y={player.exp}
                      r={6}
                      fill="#22d3ee"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <ReferenceLine
                      x={currentRealm.name}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: '當前境界',
                        position: 'top',
                        fill: '#fbbf24',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    />
                  </AreaChart>
                ) : (
                  <AreaChart
                    data={historicalData}
                    margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="historyExpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2633" vertical={false} />
                    <XAxis
                      dataKey="ageLabel"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(val) =>
                        val >= 10000 ? `${(val / 10000).toFixed(0)}萬` : val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
                      }
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#141822]/95 border border-cyan-500/80 rounded-lg p-3 text-xs shadow-2xl backdrop-blur-md space-y-1 min-w-[170px]">
                              <span className="font-bold text-cyan-300 text-sm">{data.ageLabel}</span>
                              <div className="flex justify-between">
                                <span className="text-slate-400">身處境界：</span>
                                <span className="font-bold text-amber-300">{data.realmName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">真元總積累：</span>
                                <span className="font-mono text-cyan-300 font-bold">
                                  {data.totalExp.toLocaleString()} 點
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalExp"
                      name="歷年累計修為"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#historyExpGrad)"
                    />
                    <ReferenceDot
                      x={`${player.age} 歲`}
                      y={historicalData[historicalData.length - 1]?.totalExp || player.exp}
                      r={6}
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Realm Ladder Table */}
          <div className="bg-[#141822] border border-[#232936] rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                諸天九境天道門檻詳解 (Nine Heavens Cultivation Milestones)
              </span>
              <span className="text-[10px] text-slate-400">隨境界攀升，所需靈氣呈幾何級倍增</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="pb-2 font-medium">境界</th>
                    <th className="pb-2 font-medium">突破所需靈氣</th>
                    <th className="pb-2 font-medium">突破雷劫威力</th>
                    <th className="pb-2 font-medium">氣血法相上限</th>
                    <th className="pb-2 font-medium">天命壽元</th>
                    <th className="pb-2 font-medium">破境至寶</th>
                    <th className="pb-2 font-medium text-right">狀態判定</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {realmCurveData.map((r) => {
                    const isPast = r.index < player.realmIdx;
                    const isCurrent = r.index === player.realmIdx;

                    return (
                      <tr
                        key={r.name}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-amber-950/30 text-amber-200 font-bold'
                            : isPast
                            ? 'text-slate-400 hover:text-slate-300'
                            : 'text-slate-500'
                        }`}
                      >
                        <td className="py-2.5 font-sans flex items-center gap-1.5">
                          {isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          ) : isPast ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                          )}
                          <span className={isCurrent ? 'text-amber-300 font-bold' : ''}>
                            {r.name}
                          </span>
                        </td>
                        <td className="py-2.5 text-amber-400">
                          {r.realmRequirement.toLocaleString()} 點
                        </td>
                        <td className="py-2.5 text-rose-400">
                          {r.tribulationDamage} 點
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {r.hp.toLocaleString()} HP
                        </td>
                        <td className="py-2.5 text-emerald-400">
                          {r.lifespan} 歲
                        </td>
                        <td className="py-2.5 text-purple-300 font-sans text-[11px]">
                          {r.matRequired}
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          {isPast ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              ✓ 已登臨
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
                              ⚡ 當前參悟中
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                              未達
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>當前突破進度：</span>
            <span className="text-cyan-300 font-mono font-bold ml-1">
              {player.exp} / {currentRealm.maxExp} ({Math.floor(expPercent)}%)
            </span>
            {isExpFull && (
              <span className="ml-2 text-amber-400 font-bold">
                ⚡ 氣血圓滿，可隨時引動雷劫突破！
              </span>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2 px-4 bg-[#1b2230] hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              關閉天機圖
            </button>
            {onOpenBreakthrough && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBreakthrough();
                }}
                className="flex-1 sm:flex-initial py-2 px-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {isExpFull ? '引動天劫破境' : '查驗突破所需'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
