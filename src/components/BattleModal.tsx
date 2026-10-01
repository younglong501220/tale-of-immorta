import React, { useState, useEffect, useRef } from 'react';
import { Enemy, Item, Player } from '../types/game';
import { sound } from '../utils/audio';
import { Swords, Heart, Shield, Flame, Sparkles, AlertCircle, Wind } from 'lucide-react';

interface Props {
  player: Player;
  enemy: Enemy;
  onVictory: (loot: { gold: number; item?: Item; killLoot: boolean }) => void;
  onDefeat: () => void;
  onFlee: () => void;
}

export const BattleModal: React.FC<Props> = ({
  player,
  enemy,
  onVictory,
  onDefeat,
  onFlee,
}) => {
  const [playerHp, setPlayerHp] = useState<number>(player.hp);
  const [enemyHp, setEnemyHp] = useState<number>(enemy.hp);
  const [ultimateCooldown, setUltimateCooldown] = useState<number>(0);
  const [shield, setShield] = useState<number>(() => {
    // 視靈如命 passive shield
    if (player.destinies.some((d) => d.id === 'spirit_shield')) {
      return Math.floor(player.maxHp * 0.3);
    }
    return 0;
  });
  const [yellowTurbanHp, setYellowTurbanHp] = useState<number>(() => {
    // 黃巾天師 passive guardian
    if (player.destinies.some((d) => d.id === 'yellow_turban')) {
      return Math.floor(player.maxHp * 0.4);
    }
    return 0;
  });

  const [combatLogs, setCombatLogs] = useState<{ id: string; text: string; color: string }[]>([
    {
      id: 'init',
      text: `⚔️ 遭遇【${enemy.name}】(${enemy.realmName})！雙方引動本命靈壓，生死鬥法一觸即發！`,
      color: 'text-amber-300 font-bold',
    },
  ]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [actionLocked, setActionLocked] = useState<boolean>(false);

  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLogs]);

  // Turn: Player Attack
  const handlePlayerAttack = (isUltimate: boolean = false) => {
    if (actionLocked || isFinished) return;
    setActionLocked(true);
    sound.playSlash();

    let logsToAdd: { id: string; text: string; color: string }[] = [];

    // Calculate damage
    let baseDmg = player.atk;
    if (player.destinies.some((d) => d.id === 'sword_mastery')) {
      baseDmg = Math.floor(baseDmg * 1.2);
    }

    let multiplier = isUltimate ? 2.2 : 1.0;
    let rollVariance = Math.floor(Math.random() * 12) - 5;
    let netDmg = Math.max(12, Math.floor((baseDmg - enemy.def * 0.5 + rollVariance) * multiplier));

    // Crit check
    let isCrit = false;
    let critChance = player.traits.some((t) => t.special === 'crit') ? 0.4 : 0.15;
    if (player.destinies.some((d) => d.id === 'thunder_dash')) critChance += 0.2;
    // Alliance Scripture Library passive: Increased critical hit chance
    const scriptureCritLvl = player.unlockedScriptures?.['scripture_crit_chance'] || 0;
    critChance += scriptureCritLvl * 0.06;

    let critMultiplier = 1.6;
    const scriptureCritDmgLvl = player.unlockedScriptures?.['scripture_crit_dmg'] || 0;
    critMultiplier += scriptureCritDmgLvl * 0.2;

    if (Math.random() < critChance) {
      isCrit = true;
      netDmg = Math.floor(netDmg * critMultiplier);
    }

    if (isUltimate) {
      logsToAdd.push({
        id: Math.random().toString(),
        text: `✨ 你施展本命絕技神通【萬劍歸宗·破天式】！劍氣縱橫，對敵方造成 ${netDmg} 點毀滅傷害！${isCrit ? '💥 (暴擊!!)' : ''}`,
        color: 'text-yellow-300 font-bold',
      });
      setUltimateCooldown(3);
    } else {
      logsToAdd.push({
        id: Math.random().toString(),
        text: `🗡️ 你運轉法寶飛劍刺出，重創【${enemy.name}】，造成 ${netDmg} 點傷害！${isCrit ? '💥 (神識暴擊!!)' : ''}`,
        color: 'text-cyan-300',
      });
      if (ultimateCooldown > 0) setUltimateCooldown((prev) => prev - 1);
    }

    // 雙靈共生 passive: 35% chance to double cast
    if (isUltimate && player.destinies.some((d) => d.id === 'twin_spirit') && Math.random() < 0.35) {
      let doubleDmg = Math.floor(netDmg * 0.8);
      netDmg += doubleDmg;
      logsToAdd.push({
        id: Math.random().toString(),
        text: `🌌 觸發【逆天改命·雙靈共生】！虛空共鳴引動二次神威，追加 ${doubleDmg} 點暴烈靈擊！`,
        color: 'text-purple-300 font-bold',
      });
    }

    // 劍靈入門 passive: extra sword damage every turn
    if (player.destinies.some((d) => d.id === 'sword_spirit')) {
      let swordDmg = Math.floor(player.atk * 0.35) + 15;
      netDmg += swordDmg;
      logsToAdd.push({
        id: Math.random().toString(),
        text: `⚔️ 【逆天改命·劍靈入門】護體飛劍嗡鳴破空，主動刺向敵人，追加 ${swordDmg} 點穿透打擊！`,
        color: 'text-cyan-200',
      });
    }

    // 血魔大法 passive: 25% lifesteal
    if (player.destinies.some((d) => d.id === 'blood_drain')) {
      let drainHeal = Math.floor(netDmg * 0.25);
      setPlayerHp((prev) => Math.min(player.maxHp, prev + drainHeal));
      logsToAdd.push({
        id: Math.random().toString(),
        text: `🩸 觸發【逆天改命·血魔大法】！吸取敵方精血，自身恢復 ${drainHeal} 點氣血！`,
        color: 'text-rose-400',
      });
    }

    let nextEnemyHp = Math.max(0, enemyHp - netDmg);
    setEnemyHp(nextEnemyHp);
    setCombatLogs((prev) => [...prev, ...logsToAdd]);

    if (nextEnemyHp <= 0) {
      sound.playBreakthrough();
      setTimeout(() => {
        setCombatLogs((prev) => [
          ...prev,
          {
            id: 'win',
            text: `🏆 經過一番血戰，你強勢擊敗了【${enemy.name}】！`,
            color: 'text-amber-400 font-extrabold text-sm',
          },
        ]);
        setIsWon(true);
        setIsFinished(true);
        setActionLocked(false);
      }, 400);
      return;
    }

    // Enemy Turn after small delay
    setTimeout(() => {
      handleEnemyTurn(nextEnemyHp);
    }, 600);
  };

  const handleEnemyTurn = (currentEhp: number) => {
    if (currentEhp <= 0) return;

    // Dodge check (疾風迅雷)
    if (player.destinies.some((d) => d.id === 'thunder_dash') && Math.random() < 0.2) {
      setCombatLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          text: `💨 觸發【逆天改命·疾風迅雷】！身如殘影，巧妙閃避了【${enemy.name}】的致命殺招！`,
          color: 'text-emerald-300 font-semibold',
        },
      ]);
      setActionLocked(false);
      return;
    }

    let eDmg = Math.max(8, enemy.atk - player.def * 0.6 + Math.floor(Math.random() * 8) - 3);

    // Check Yellow Turban Guardian absorption
    if (yellowTurbanHp > 0) {
      if (yellowTurbanHp >= eDmg) {
        setYellowTurbanHp((prev) => prev - eDmg);
        setCombatLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: `🛡️ 【黃巾天師·金甲力士】挺身而出，替你完全抵擋了 ${eDmg} 點猛烈打擊！`,
            color: 'text-yellow-400',
          },
        ]);
        setActionLocked(false);
        return;
      } else {
        eDmg -= yellowTurbanHp;
        setYellowTurbanHp(0);
        setCombatLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: `🛡️ 【黃巾天師·金甲力士】力竭消散，剩餘 ${eDmg} 點傷害突破防線！`,
            color: 'text-yellow-600',
          },
        ]);
      }
    }

    // Check Spirit Shield absorption
    if (shield > 0) {
      if (shield >= eDmg) {
        setShield((prev) => prev - eDmg);
        setCombatLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: `💠 【視靈如命·護身法盾】泛起微光，吸收了全部 ${eDmg} 點傷害！`,
            color: 'text-blue-300',
          },
        ]);
        setActionLocked(false);
        return;
      } else {
        eDmg -= shield;
        setShield(0);
        setCombatLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: `💠 護身法盾破碎！受創 ${eDmg} 點氣血！`,
            color: 'text-blue-500',
          },
        ]);
      }
    }

    // Alliance Scripture passive: Damage Reduction
    const scriptureDmgReduceLvl = player.unlockedScriptures?.['scripture_dmg_reduce'] || 0;
    if (scriptureDmgReduceLvl > 0) {
      eDmg = Math.max(1, Math.floor(eDmg * (1 - scriptureDmgReduceLvl * 0.05)));
    }

    let nextPlayerHp = Math.max(0, playerHp - Math.floor(eDmg));
    setPlayerHp(nextPlayerHp);

    setCombatLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        text: `💥 【${enemy.name}】施展兇悍殺招，對你造成 ${Math.floor(eDmg)} 點痛擊！${scriptureDmgReduceLvl > 0 ? ` (混元真體減傷 ${scriptureDmgReduceLvl * 5}%)` : ''}`,
        color: 'text-rose-400',
      },
    ]);

    if (nextPlayerHp <= 0) {
      setTimeout(() => {
        onDefeat();
      }, 500);
      return;
    }

    setActionLocked(false);
  };

  // Use Healing Pill in Battle
  const handleUsePill = () => {
    if (actionLocked || isFinished) return;
    const pill = player.inventory.find((i) => i.type === 'pill' && i.effect?.healHp);
    if (!pill) {
      setCombatLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          text: `⚠️ 儲物戒中已無現成療傷丹藥！`,
          color: 'text-slate-400',
        },
      ]);
      return;
    }

    sound.playDing();
    setActionLocked(true);
    const healAmt = pill.effect?.healHp || 300;
    const newHp = Math.min(player.maxHp, playerHp + healAmt);
    setPlayerHp(newHp);

    setCombatLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        text: `💊 你吞服了一枚【${pill.name}】，氣血瞬間湧動，恢復了 ${healAmt} 點氣血！`,
        color: 'text-emerald-400 font-bold',
      },
    ]);

    // Enemy still attacks after player takes turn to heal
    setTimeout(() => {
      handleEnemyTurn(enemyHp);
    }, 500);
  };

  // Flee
  const handleFlee = () => {
    if (actionLocked || isFinished) return;
    if (Math.random() < 0.6) {
      sound.playDing();
      setCombatLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          text: `💨 你祭出身法靈符，化作一道青煙成功遁走！`,
          color: 'text-cyan-300 font-bold',
        },
      ]);
      setTimeout(onFlee, 400);
    } else {
      setCombatLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          text: `❌ 遁法被【${enemy.name}】神念鎖定截斷，逃跑失敗！`,
          color: 'text-rose-400',
        },
      ]);
      setActionLocked(true);
      setTimeout(() => {
        handleEnemyTurn(enemyHp);
      }, 500);
    }
  };

  const handleFinishLoot = (killLoot: boolean) => {
    sound.playCoin();
    const goldBonusLvl = player.unlockedScriptures?.['scripture_fortune_gold'] || 0;
    const goldMultiplier = 1 + goldBonusLvl * 0.2;
    let baseLootGold = enemy.dropGold + (killLoot ? Math.floor(enemy.dropGold * 0.8) : 0);
    let lootGold = Math.floor(baseLootGold * goldMultiplier);
    onVictory({
      gold: lootGold,
      item: enemy.dropItem,
      killLoot,
    });
  };

  const pHpPercent = Math.min(100, Math.max(0, (playerHp / player.maxHp) * 100));
  const eHpPercent = Math.min(100, Math.max(0, (enemyHp / enemy.maxHp) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#131720] border-2 border-rose-800/80 rounded-xl p-5 shadow-[0_0_50px_rgba(225,29,72,0.3)] text-slate-200">
        {/* Battle Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="text-lg font-bold text-rose-300">
              {enemy.isCultivator ? '生死鬥法 · 修士交鋒' : '山海蠻荒 · 激戰凶獸'}
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300 font-semibold">
            {enemy.realmName}
          </span>
        </div>

        {/* Combatants Status */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Player */}
          <div className="bg-[#191e29] p-3 rounded-lg border border-cyan-900/50">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-cyan-300">{player.name} (你)</span>
              <span className="font-mono text-slate-300">
                {playerHp} / {player.maxHp}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-300"
                style={{ width: `${pHpPercent}%` }}
              />
            </div>
            <div className="flex gap-2 mt-2 text-[11px] text-slate-400">
              {shield > 0 && <span className="text-blue-300">💠護盾:{shield}</span>}
              {yellowTurbanHp > 0 && <span className="text-yellow-400">🛡️金甲衛:{yellowTurbanHp}</span>}
            </div>
          </div>

          {/* Enemy */}
          <div className="bg-[#191e29] p-3 rounded-lg border border-rose-900/50">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-rose-400">{enemy.name}</span>
              <span className="font-mono text-slate-300">
                {enemyHp} / {enemy.maxHp}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-rose-950">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-rose-500 transition-all duration-300"
                style={{ width: `${eHpPercent}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              攻: <span className="text-amber-300">{enemy.atk}</span> · 防: <span className="text-cyan-300">{enemy.def}</span>
            </div>
          </div>
        </div>

        {/* Combat Log Box */}
        <div className="h-44 bg-[#0a0d13] border border-slate-800 rounded-lg p-3 overflow-y-auto font-mono text-xs space-y-1.5 mb-4 shadow-inner">
          {combatLogs.map((log) => (
            <div key={log.id} className={`leading-relaxed ${log.color}`}>
              {log.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Action Controls */}
        {!isFinished ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handlePlayerAttack(false)}
              disabled={actionLocked}
              className="py-2.5 px-3 bg-gradient-to-r from-cyan-900/80 to-blue-900/80 hover:from-cyan-800 hover:to-blue-800 text-cyan-200 font-bold text-xs rounded-lg border border-cyan-600/70 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Swords className="w-3.5 h-3.5" /> 普通武技
            </button>

            <button
              onClick={() => handlePlayerAttack(true)}
              disabled={actionLocked || ultimateCooldown > 0}
              className="py-2.5 px-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-extrabold text-xs rounded-lg border border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {ultimateCooldown > 0 ? `神通蓄力 (${ultimateCooldown}回)` : '⚡ 絕技神通'}
            </button>

            <button
              onClick={handleUsePill}
              disabled={actionLocked}
              className="py-2.5 px-3 bg-[#1c2331] hover:bg-[#252f42] text-emerald-300 font-bold text-xs rounded-lg border border-emerald-700/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5 text-emerald-400" /> 服用靈丹
            </button>

            <button
              onClick={handleFlee}
              disabled={actionLocked}
              className="py-2.5 px-3 bg-[#191d26] hover:bg-[#222733] text-slate-400 hover:text-slate-200 font-medium text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Wind className="w-3.5 h-3.5" /> 施法遁走
            </button>
          </div>
        ) : isWon ? (
          <div className="space-y-3 animate-in fade-in duration-300">
            {enemy.isCultivator ? (
              <div>
                <p className="text-xs text-slate-400 mb-3 text-center">
                  對方已重傷落敗，跪地求饒！你是秉持正道慈悲放行，還是斬草除根掠奪其生平儲物戒指？
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleFinishLoot(true)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-amber-200 font-extrabold text-xs rounded-lg border border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    💀 斬草除根，殺人奪寶！(+儲物戒全額靈石)
                  </button>
                  <button
                    onClick={() => handleFinishLoot(false)}
                    className="flex-1 py-3 px-4 bg-[#1f2635] hover:bg-[#283246] text-cyan-300 font-semibold text-xs rounded-lg border border-cyan-800/80 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    🕊️ 得饒人處且饒人 (結善緣，放其離去)
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleFinishLoot(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-lg border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer"
              >
                🦴 採集凶獸內丹與天材地寶 (結束戰鬥)
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
