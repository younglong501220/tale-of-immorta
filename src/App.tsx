import React, { useState, useEffect } from 'react';
import {
  AuctionItem,
  Destiny,
  DiplomaticLogCategory,
  DiplomaticLogEntry,
  DiplomaticRoleType,
  DomainTerritory,
  Enemy,
  ImmortalAlliance,
  Item,
  LogEntry,
  Player,
  Realm,
  RivalAlliance,
  SectRank,
  SectType,
  Trait,
} from './types/game';
import {
  ALL_DESTINIES,
  ALLIANCE_MERIT_SHOP_ITEMS,
  ALLIANCE_SCRIPTURES,
  BREAKTHROUGH_ITEMS,
  CONSUMABLE_PILLS,
  DEFAULT_DIPLOMATIC_LOGS,
  DEFAULT_TERRITORIES,
  FORTIFICATION_TIERS,
  KUNGFU_MANUALS,
  REALMS,
  RIVAL_ALLIANCES,
} from './data/gameData';
import { sound } from './utils/audio';

import { HeaderNav } from './components/HeaderNav';
import { CharacterSidebar } from './components/CharacterSidebar';
import { ExploreTab } from './components/ExploreTab';
import { AuctionTab } from './components/AuctionTab';
import { SectTab } from './components/SectTab';
import { MeditateTab } from './components/MeditateTab';
import { BagTab } from './components/BagTab';
import { AllianceTab } from './components/AllianceTab';
import { LogPanel } from './components/LogPanel';
import { CreateModal } from './components/CreateModal';
import { BreakthroughModal } from './components/BreakthroughModal';
import { BattleModal } from './components/BattleModal';
import { HelpModal } from './components/HelpModal';

const SAVE_KEY = 'guigubahuang_game_save_v1';
const TERRITORIES_KEY = 'guigubahuang_territories_save_v1';
const DIPLOMATIC_LOGS_KEY = 'guigubahuang_diplomatic_logs_v1';

const DEFAULT_PLAYER: Player = {
  name: '韓立',
  gender: 'male',
  title: '八荒散修',
  realmIdx: 0,
  hp: 180,
  maxHp: 180,
  exp: 0,
  atk: 25,
  def: 8,
  int: 45,
  luk: 30,
  gold: 200,
  age: 16,
  maxAge: 100,
  traits: [],
  destinies: [],
  inventory: [
    {
      id: 'init_zhuji_gas',
      name: '天道地道之氣',
      type: 'material',
      desc: '初入大荒偶得的天地清氣，乃衝擊【築基境】不可多得之物。',
      price: 450,
      rarity: 'rare',
    },
    {
      id: 'init_pill_1',
      name: '九轉回春丹',
      type: 'pill',
      desc: '療傷寶丹，瞬間恢復 400 點氣血。',
      price: 150,
      rarity: 'common',
      effect: { healHp: 400 },
    },
  ],
  sect: null,
  alliance: null,
  killCount: 0,
  demonicKarma: 0,
  righteousKarma: 0,
  equippedSkills: ['太虛吐納功'],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'explore' | 'sect' | 'auction' | 'meditate' | 'bag' | 'alliance'
  >('explore');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isBreakthroughOpen, setIsBreakthroughOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [activeBattleEnemy, setActiveBattleEnemy] = useState<Enemy | null>(null);
  const [pendingAmbushAuctionIdx, setPendingAmbushAuctionIdx] = useState<number | null>(null);
  const [pendingConquerTerritoryId, setPendingConquerTerritoryId] = useState<string | null>(null);

  // Death modal state
  const [deathReason, setDeathReason] = useState<string | null>(null);

  // Player State
  const [player, setPlayer] = useState<Player>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PLAYER;
  });

  // Territories state (Cross-Server Domain Contention)
  const [territories, setTerritories] = useState<DomainTerritory[]>(() => {
    try {
      const saved = localStorage.getItem(TERRITORIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_TERRITORIES;
  });

  const [rivalAlliances, setRivalAlliances] = useState<RivalAlliance[]>(RIVAL_ALLIANCES);

  // Cross-Server Alliance Diplomatic Logs State
  const [diplomaticLogs, setDiplomaticLogs] = useState<DiplomaticLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(DIPLOMATIC_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_DIPLOMATIC_LOGS;
  });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'l1',
      age: 16,
      text: '✦ 歡迎降世山海大荒！天地造化，修仙之路逆天而行，勝者長生！',
      colorType: 'gold',
    },
    {
      id: 'l2',
      age: 16,
      text: '⚔️ 跨服仙盟爭霸全面開闢！諸天各服仙尊列陣八荒，領地稅收爭奪戰一觸即發！',
      colorType: 'purple',
    },
  ]);

  // Auction Items Pool
  const [auctionList, setAuctionList] = useState<AuctionItem[]>(() => {
    return generateAuctionPool(16);
  });

  // Check initial creation
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
      setIsCreateOpen(true);
    }
  }, []);

  // Auto save
  useEffect(() => {
    if (player) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(player));
    }
  }, [player]);

  useEffect(() => {
    if (territories) {
      localStorage.setItem(TERRITORIES_KEY, JSON.stringify(territories));
    }
  }, [territories]);

  useEffect(() => {
    if (diplomaticLogs) {
      localStorage.setItem(DIPLOMATIC_LOGS_KEY, JSON.stringify(diplomaticLogs));
    }
  }, [diplomaticLogs]);

  const addDiplomaticLog = (
    category: DiplomaticLogCategory,
    territoryName: string,
    title: string,
    desc: string,
    actor: string,
    strategicImpact: string
  ) => {
    const newEntry: DiplomaticLogEntry = {
      id: `dlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      age: player.age,
      dateStr: `大荒曆 · ${player.age} 歲`,
      category,
      territoryName,
      title,
      desc,
      actor,
      strategicImpact,
    };
    setDiplomaticLogs((prev) => [newEntry, ...prev]);
  };

  const addLog = (text: string, colorType: LogEntry['colorType'] = 'normal') => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        age: player.age,
        text,
        colorType,
      },
    ]);
  };

  // Helper to generate dynamic auction pool
  function generateAuctionPool(playerAge: number): AuctionItem[] {
    const holders = [
      '縹緲散人·李慕白',
      '百花谷聖女·陸雪琪',
      '血煞門長老·厲九幽',
      '九陽宗少主·炎烈',
      '雲夢澤散修·古三通',
      '天機閣執事·諸葛孔明',
    ];

    const catalog: Item[] = [
      ...BREAKTHROUGH_ITEMS,
      ...CONSUMABLE_PILLS,
      ...KUNGFU_MANUALS,
    ];

    const shuffled = [...catalog].sort(() => 0.5 - Math.random()).slice(0, 6);

    return shuffled.map((item, idx) => ({
      id: `auction_${playerAge}_${idx}_${item.id}`,
      item,
      originalPrice: item.price,
      currentBid: item.price,
      holder: holders[idx % holders.length],
      isPlayerWinning: false,
      bidsCount: 0,
    }));
  }

  // Helper to accumulate taxes over time
  const accumulateTerritoryTaxes = (years: number) => {
    if (!player.alliance) return;
    const treasuryMultiplier = 1 + player.alliance.treasuryLevel * 0.15;
    const weeksPassed = Math.max(1, Math.floor(years * 52));

    setTerritories((prev) =>
      prev.map((t) => {
        if (t.ownerAllianceName === player.alliance?.name) {
          const addedTax = Math.floor(t.weeklyTaxGold * weeksPassed * treasuryMultiplier);
          const addedResource = Math.max(1, Math.floor(years * 2));
          return {
            ...t,
            unclaimedTaxGold: t.unclaimedTaxGold + addedTax,
            unclaimedResourceCount: t.unclaimedResourceCount + addedResource,
          };
        }
        return t;
      })
    );
  };

  // --- Handlers ---
  const handleToggleSound = () => {
    const nextState = sound.toggleSound();
    setSoundEnabled(nextState);
  };

  const handleStartGame = (name: string, gender: 'male' | 'female', traits: Trait[]) => {
    let baseHp = 180;
    let baseAtk = 25;
    let baseDef = 8;
    let baseInt = 45;
    let baseLuk = 30;
    let baseGold = 300;
    let baseLifespan = 100;

    // Apply traits
    traits.forEach((t) => {
      if (t.atk) baseAtk += t.atk;
      if (t.def) baseDef += t.def;
      if (t.int) baseInt += t.int;
      if (t.luk) baseLuk += t.luk;
      if (t.hp) baseHp += t.hp;
      if (t.gold) baseGold += t.gold;
      if (t.lifespan) baseLifespan += t.lifespan;
    });

    const newPlayer: Player = {
      ...DEFAULT_PLAYER,
      name,
      gender,
      hp: baseHp,
      maxHp: baseHp,
      atk: baseAtk,
      def: baseDef,
      int: baseInt,
      luk: baseLuk,
      gold: baseGold,
      maxAge: baseLifespan,
      traits,
      destinies: [],
      inventory: [
        {
          id: 'init_zhuji_gas',
          name: '天道地道之氣',
          type: 'material',
          desc: '初入大荒偶得的天地精華，乃衝擊【築基境】不可多得之物。',
          price: 450,
          rarity: 'rare',
        },
        {
          id: 'init_pill_1',
          name: '九轉回春丹',
          type: 'pill',
          desc: '療傷寶丹，瞬間恢復 400 點氣血。',
          price: 150,
          rarity: 'common',
          effect: { healHp: 400 },
        },
      ],
    };

    setPlayer(newPlayer);
    setTerritories(DEFAULT_TERRITORIES);
    setIsCreateOpen(false);
    setDeathReason(null);
    setLogs([
      {
        id: Math.random().toString(),
        age: 16,
        text: `✨ 【${name}】降生大荒修仙界！身具【${traits.map((t) => t.name).join('、')}】之先天氣運，踏上逆天改命大道！`,
        colorType: 'gold',
      },
    ]);
  };

  const handleResetGame = () => {
    if (window.confirm('確定要散盡修為，轉世重修嗎？當前進度將重置。')) {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(TERRITORIES_KEY);
      localStorage.removeItem(DIPLOMATIC_LOGS_KEY);
      setIsCreateOpen(true);
    }
  };

  // --- Diplomatic Summit Decrees ---
  const handleIssueDiplomaticDecree = (
    category: DiplomaticLogCategory,
    territoryId: string,
    targetAlliance: string,
    decreeTitle: string,
    decreeDesc: string,
    strategicImpact: string
  ) => {
    if (!player.alliance) return;

    sound.playDing();

    // 1. If Tax Decree: increase that territory's weekly tax rate by 20%
    if (category === 'tax' && territoryId) {
      setTerritories((prev) =>
        prev.map((t) =>
          t.id === territoryId
            ? {
                ...t,
                weeklyTaxGold: Math.floor(t.weeklyTaxGold * 1.2),
                unclaimedTaxGold: t.unclaimedTaxGold + Math.floor(t.weeklyTaxGold * 0.2),
              }
            : t
        )
      );
    }

    // 2. If Defense Decree: reinforce all owned shields by 1000
    if (category === 'defense') {
      setTerritories((prev) =>
        prev.map((t) =>
          t.ownerAllianceName === player.alliance?.name
            ? {
                ...t,
                shieldHp: Math.min(t.maxShieldHp, t.shieldHp + 1000),
              }
            : t
        )
      );
    }

    // 3. If Negotiation Pact: gain diplomatic tribute 1500 gold
    if (category === 'negotiation') {
      setPlayer((p) => ({
        ...p,
        gold: p.gold + 1500,
        righteousKarma: p.righteousKarma + 20,
      }));
    }

    const territory = territories.find((t) => t.id === territoryId);
    const territoryName = territory ? territory.name : '八荒萬界各州域';

    addDiplomaticLog(
      category,
      territoryName,
      decreeTitle,
      decreeDesc,
      `盟主 ${player.name}`,
      strategicImpact
    );

    addLog(`📜 仙盟政略告諭：【${decreeTitle}】已昭告萬界！${strategicImpact}！`, 'gold');
  };

  // --- Exploration System ---
  const handleExploreRegion = (regionKey: 'forest' | 'leize' | 'huafeng' | 'forbidden') => {
    let months = 1;
    let baseExp = 35;

    if (regionKey === 'forest') {
      months = 1;
      baseExp = 45;
    } else if (regionKey === 'leize') {
      months = 3;
      baseExp = 180;
    } else if (regionKey === 'huafeng') {
      months = 6;
      baseExp = 550;
    } else if (regionKey === 'forbidden') {
      months = 12;
      baseExp = 1800;
    }

    // Age progression
    const yearsPassed = Math.max(1, Math.floor(months / 12));
    const nextAge = player.age + (months >= 12 ? yearsPassed : Math.random() < 0.25 ? 1 : 0);

    if (nextAge >= player.maxAge) {
      setDeathReason(`享年 ${nextAge} 歲，歷練途中壽元耗盡，未能逆天破境，含恨坐化！`);
      return;
    }

    // Accumulate territory taxes
    accumulateTerritoryTaxes(months / 12);

    // Exp gain
    let boost = player.traits.some((t) => t.expBoost) ? 1.5 : 1.0;
    if (player.alliance) {
      boost += player.alliance.spiritArrayLevel * 0.1;
    }
    let gainedExp = Math.floor(baseExp * (1 + player.int / 150) * boost);

    let roll = Math.random();

    // 40% Chance Beast Combat
    if (roll < 0.42) {
      const beastList: {
        name: string;
        realm: string;
        hpMult: number;
        atkMult: number;
        dropMat?: Item;
      }[] = [
        { name: '赤目巨猿', realm: '練氣圓滿', hpMult: 1.1, atkMult: 1.0 },
        {
          name: '驚雷巨雕',
          realm: '築基初期',
          hpMult: 1.6,
          atkMult: 1.3,
          dropMat: BREAKTHROUGH_ITEMS[0],
        },
        {
          name: '雷澤鳴蛇',
          realm: '金丹中境',
          hpMult: 2.5,
          atkMult: 1.8,
          dropMat: BREAKTHROUGH_ITEMS[1],
        },
        {
          name: '百萬山陸吾',
          realm: '具靈大妖',
          hpMult: 4.5,
          atkMult: 2.6,
          dropMat: BREAKTHROUGH_ITEMS[2],
        },
        {
          name: '遠古凶獸·饕餮',
          realm: '元嬰老妖',
          hpMult: 8.0,
          atkMult: 3.8,
          dropMat: BREAKTHROUGH_ITEMS[3],
        },
        {
          name: '荒古神魔·窮奇',
          realm: '化神始祖',
          hpMult: 16.0,
          atkMult: 5.5,
          dropMat: BREAKTHROUGH_ITEMS[4],
        },
      ];

      let pickedIdx = Math.min(
        beastList.length - 1,
        player.realmIdx + (Math.random() < 0.3 ? 1 : 0)
      );
      let beast = beastList[pickedIdx];

      const enemy: Enemy = {
        id: `beast_${Date.now()}`,
        name: beast.name,
        title: '山海大荒古獸',
        realmName: beast.realm,
        hp: Math.floor(180 * beast.hpMult),
        maxHp: Math.floor(180 * beast.hpMult),
        atk: Math.floor(25 * beast.atkMult),
        def: Math.floor(8 * beast.atkMult * 0.7),
        isCultivator: false,
        dropGold: Math.floor(100 * beast.hpMult),
        dropItem: beast.dropMat,
      };

      setPlayer((p) => ({ ...p, age: nextAge, exp: p.exp + gainedExp }));
      addLog(`🐾 於大荒歷練途中，驚醒了盤踞在此的【${beast.name}】(${beast.realm})！`, 'red');
      setActiveBattleEnemy(enemy);
      return;
    }

    // 35% Chance Find Rare Herb / Breakthrough Material
    if (roll < 0.77) {
      let pool = [...BREAKTHROUGH_ITEMS, ...CONSUMABLE_PILLS];
      let found = pool[Math.floor(Math.random() * pool.length)];

      setPlayer((p) => ({
        ...p,
        age: nextAge,
        exp: p.exp + gainedExp,
        inventory: [...p.inventory, found],
      }));

      sound.playDing();
      addLog(
        `🌿 踏遍險峰，你在古樹靈脈深處幸運採摘到了珍稀靈物【${found.name}】！修為 +${gainedExp} 點。`,
        'gold'
      );
      return;
    }

    // 23% Chance Ancient Cave Abode / Spirit Stones
    let goldFound = 150 + player.realmIdx * 250 + Math.floor(Math.random() * 200);
    setPlayer((p) => ({
      ...p,
      age: nextAge,
      exp: p.exp + gainedExp,
      gold: p.gold + goldFound,
    }));
    sound.playCoin();
    addLog(
      `💰 你於幽谷深處發現前代散修坐化之洞府，尋得散落靈石 +${goldFound}！修為 +${gainedExp} 點。`,
      'cyan'
    );
  };

  // Random Encounter (漫無目的遊歷)
  const handleTriggerRandomEvent = () => {
    const nextAge = player.age + (Math.random() < 0.3 ? 1 : 0);
    if (nextAge >= player.maxAge) {
      setDeathReason(`享年 ${nextAge} 歲，漫步大荒途中大限降臨，坐化歸墟！`);
      return;
    }

    const r = Math.random();

    // 35% Cultivator Ambush
    if (r < 0.35) {
      const cultivatorNames = [
        '狂刀邪修·斷水流',
        '九幽魔宗外門執事',
        '萬寶閣截道惡散修',
        '玄冥二老殘魂',
        '天劍門叛逆劍侍',
      ];
      let name = cultivatorNames[Math.floor(Math.random() * cultivatorNames.length)];
      let curR = REALMS[player.realmIdx];

      const enemy: Enemy = {
        id: `cultivator_${Date.now()}`,
        name,
        title: '攔路劫修',
        realmName: curR.name,
        hp: Math.floor(curR.maxHp * 0.9),
        maxHp: Math.floor(curR.maxHp * 0.9),
        atk: Math.floor(curR.atk * 0.95),
        def: Math.floor(curR.def * 0.9),
        isCultivator: true,
        dropGold: 300 + player.realmIdx * 300,
        dropItem: CONSUMABLE_PILLS[Math.floor(Math.random() * CONSUMABLE_PILLS.length)],
      };

      setPlayer((p) => ({ ...p, age: nextAge }));
      addLog(`⚠️ 荒野古道突遭【${name}】攔路！對方見你衣著不凡，欲行殺人越貨之舉！`, 'red');
      setActiveBattleEnemy(enemy);
      return;
    }

    // 35% Spirit Spring Bath (Heals to full + raises Int)
    if (r < 0.7) {
      setPlayer((p) => ({
        ...p,
        age: nextAge,
        hp: p.maxHp,
        int: p.int + 2,
        exp: p.exp + 100,
      }));
      sound.playDing();
      addLog(
        `💧 你偶入一處靈氣四溢的先天靈泉，沐浴洗髓！氣血完全回滿，悟性永久 +2，修為 +100！`,
        'cyan'
      );
      return;
    }

    // 30% Wandering Alchemist exchange
    let expGain = 160 + player.realmIdx * 80;
    setPlayer((p) => ({
      ...p,
      age: nextAge,
      exp: p.exp + expGain,
    }));
    sound.playDing();
    addLog(
      `🌌 偶遇山巔雲遊老道煮酒論經，一番指點令你靈台清明，修為大漲 +${expGain} 點！`,
      'purple'
    );
  };

  // --- Battle Results ---
  const handleBattleVictory = (loot: { gold: number; item?: Item; killLoot: boolean }) => {
    setActiveBattleEnemy(null);

    // 1. If this was a territory conquest battle
    if (pendingConquerTerritoryId) {
      const targetTerritory = territories.find((t) => t.id === pendingConquerTerritoryId);
      if (targetTerritory && player.alliance) {
        sound.playConquer();

        // Update territory sovereignty
        setTerritories((prev) =>
          prev.map((t) =>
            t.id === pendingConquerTerritoryId
              ? {
                  ...t,
                  ownerAllianceName: player.alliance!.name,
                  ownerServer: player.alliance!.serverOrigin,
                  unclaimedTaxGold: t.weeklyTaxGold,
                  unclaimedResourceCount: 1,
                }
              : t
          )
        );

        // Update alliance funds and level
        const bonusGold = targetTerritory.weeklyTaxGold + 2000;
        setPlayer((p) => ({
          ...p,
          gold: p.gold + bonusGold,
          alliance: p.alliance
            ? {
                ...p.alliance,
                funds: p.alliance.funds + 3000,
                level: p.alliance.level + 1,
              }
            : null,
        }));

        addLog(
          `👑 旗開得勝！你統帥跨服同盟【${player.alliance.name}】力克敵方守將【${targetTerritory.championName}】，一舉攻陷並占領【${targetTerritory.name}】！奪得此重鎮每週【八荒領地稅收權】！獲封賞靈石 +${bonusGold}！`,
          'gold'
        );

        addDiplomaticLog(
          'defense',
          targetTerritory.name,
          `【${player.alliance.name}】力克敵將，正式掌管領地主權與稅賦`,
          `盟主親征領地爭奪戰，攻破重鎮護山結界，擊敗守將【${targetTerritory.championName}】，完成主權交割。`,
          `盟主 ${player.name}`,
          `奪得每週【${targetTerritory.weeklyTaxGold.toLocaleString()} 靈石】稅收權，並掌控稀世資材【${targetTerritory.specialResource}】`
        );

        setPendingConquerTerritoryId(null);
        return;
      }
    }

    // 2. If this was an ambush from auction
    if (pendingAmbushAuctionIdx !== null) {
      const target = auctionList[pendingAmbushAuctionIdx];
      if (target) {
        setPlayer((p) => ({
          ...p,
          gold: p.gold + loot.gold,
          killCount: p.killCount + 1,
          demonicKarma: p.demonicKarma + 50,
          inventory: [...p.inventory, target.item, ...(loot.item ? [loot.item] : [])],
        }));

        // Remove item from auction
        setAuctionList((prev) => prev.filter((_, idx) => idx !== pendingAmbushAuctionIdx));
        setPendingAmbushAuctionIdx(null);

        addLog(
          `💀 截殺成功！你將【${target.holder}】斬於劍下，強行奪得拍賣至寶【${target.item.name}】，並搜刮其儲物戒獲取靈石 +${loot.gold}！魔名威震一方！`,
          'red'
        );
        return;
      }
    }

    // 3. Normal battle victory
    setPlayer((p) => {
      let updatedInv = loot.item ? [...p.inventory, loot.item] : p.inventory;
      return {
        ...p,
        gold: p.gold + loot.gold,
        killCount: p.killCount + 1,
        demonicKarma: loot.killLoot ? p.demonicKarma + 20 : p.demonicKarma,
        righteousKarma: !loot.killLoot ? p.righteousKarma + 20 : p.righteousKarma,
        inventory: updatedInv,
      };
    });

    if (loot.killLoot) {
      addLog(
        `💀 斬草除根！搜刮對方儲物仙戒，掠奪靈石 +${loot.gold}${loot.item ? `，繳獲【${loot.item.name}】` : ''}！`,
        'red'
      );
    } else {
      addLog(
        `🏆 鬥法得勝！你得饒人處且饒人，對方感激涕零奉上靈石 +${loot.gold}${loot.item ? ` 與【${loot.item.name}】` : ''}！`,
        'gold'
      );
    }
  };

  const handleBattleDefeat = () => {
    setActiveBattleEnemy(null);
    setPendingAmbushAuctionIdx(null);
    setPendingConquerTerritoryId(null);

    // Check Phoenix trait revival
    if (player.traits.some((t) => t.id === 't_phoenix') && Math.random() < 0.5) {
      sound.playBreakthrough();
      setPlayer((p) => ({ ...p, hp: Math.floor(p.maxHp * 0.4) }));
      addLog(`🔥 觸發【鳳凰真血】涅槃重塑！本命元神未滅，於火光中浴火重生！`, 'gold');
      return;
    }

    // Defeat
    setDeathReason('於生死鬥法中不敵強敵，肉身崩碎，元神俱滅，身死道消！');
  };

  const handleBattleFlee = () => {
    setActiveBattleEnemy(null);
    setPendingAmbushAuctionIdx(null);
    setPendingConquerTerritoryId(null);
    addLog(`💨 施展遁法擺脫了強敵追擊，安全返回洞府。`, 'cyan');
  };

  // --- Breakthrough & Destiny System ---
  const handleBreakthroughSuccess = (
    newRealmIdx: number,
    chosenDestiny: Destiny,
    consumedMat: string | null
  ) => {
    const nextRealm = REALMS[newRealmIdx];

    setPlayer((prev) => {
      let nextInv = [...prev.inventory];
      if (consumedMat) {
        const matIdx = nextInv.findIndex((i) => i.name === consumedMat);
        if (matIdx !== -1) nextInv.splice(matIdx, 1);
      }

      return {
        ...prev,
        realmIdx: newRealmIdx,
        exp: 0,
        maxHp: nextRealm.maxHp,
        hp: nextRealm.maxHp,
        atk: prev.atk + nextRealm.atk,
        def: prev.def + nextRealm.def,
        maxAge: nextRealm.lifespan,
        destinies: [...prev.destinies, chosenDestiny],
        inventory: nextInv,
      };
    });

    setIsBreakthroughOpen(false);

    addLog(
      `⚡ 天道神雷轟鳴！你成功渡過天劫，強勢登臨【${nextRealm.name}】！壽元大幅攀升至 ${nextRealm.lifespan} 歲！`,
      'gold'
    );
    addLog(
      `🌟 天道垂青，降下仙機！你領悟了【${chosenDestiny.name}】(${chosenDestiny.desc})！`,
      'purple'
    );
  };

  const handleTribulationDefeat = () => {
    setIsBreakthroughOpen(false);
    setDeathReason('九天玄雷威能毀天滅地，未能抗住天道反噬，形神俱滅！');
  };

  // --- Auction & Ambush ---
  const handleBidAuction = (index: number) => {
    const target = auctionList[index];
    const nextBid = target.currentBid + (target.currentBid > 3000 ? 500 : 200);

    if (player.gold < nextBid) {
      alert('靈石不足，無法加價競拍！');
      return;
    }

    setPlayer((p) => ({
      ...p,
      gold: p.gold - nextBid,
      inventory: [...p.inventory, target.item],
    }));

    setAuctionList((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              currentBid: nextBid,
              holder: player.name,
              isPlayerWinning: true,
            }
          : item
      )
    );

    addLog(
      `🎉 萬寶閣拍賣會上一擲千金！你以 ${nextBid} 靈石成功競得【${target.item.name}】，寶物已納入儲物戒！`,
      'gold'
    );
  };

  const handleAmbushAuction = (index: number) => {
    const target = auctionList[index];
    if (target.holder === player.name) {
      alert('此寶物已被你拍得，何需截殺自己？');
      return;
    }

    setPendingAmbushAuctionIdx(index);
    let curR = REALMS[player.realmIdx];

    const enemy: Enemy = {
      id: `ambush_${Date.now()}`,
      name: `拍賣得主·${target.holder}`,
      title: '身懷異寶的修士',
      realmName: curR.name,
      hp: Math.floor(curR.maxHp * 1.05),
      maxHp: Math.floor(curR.maxHp * 1.05),
      atk: Math.floor(curR.atk * 1.05),
      def: Math.floor(curR.def * 0.95),
      isCultivator: true,
      dropGold: Math.floor(target.currentBid * 0.8),
      dropItem: target.item,
    };

    addLog(
      `🗡️ 拍賣散場後，你潛伏於荒山密林，悄然尾隨【${target.holder}】，拔劍截殺奪寶！`,
      'red'
    );
    setActiveBattleEnemy(enemy);
  };

  const handleRefreshAuction = () => {
    const nextAge = player.age + 10;
    if (nextAge >= player.maxAge) {
      setDeathReason(`享年 ${nextAge} 歲，歲月悠悠十載流逝，壽元耗盡，坐化道消！`);
      return;
    }

    accumulateTerritoryTaxes(10);
    setPlayer((p) => ({ ...p, age: nextAge }));
    setAuctionList(generateAuctionPool(nextAge));
    sound.playDing();
    addLog(
      `🏛️ 八荒萬寶閣十年一度拍賣大會盛大換屆！新一批天地至寶已上架！(耗時 10 年，領地賦稅大量累積)`,
      'gold'
    );
  };

  // --- Sect System ---
  const handleJoinSect = (sectName: string, type: SectType) => {
    setPlayer((p) => ({
      ...p,
      sect: {
        id: type === 'righteous' ? 'sect_sword' : 'sect_demon',
        name: sectName,
        type,
        motto:
          type === 'righteous'
            ? '大道至簡，一劍破萬法。匡扶天地正氣，以心證道。'
            : '順我者生，逆我者亡。天地為爐，萬物為銅！',
        rank: '外門弟子',
        points: 80,
        salary: 200,
      },
      atk: type === 'demonic' ? p.atk + 25 : p.atk,
    }));

    addLog(
      `⛩️ 你已正式拜入【${sectName}】山門，獲賜外門弟子令牌！${type === 'demonic' ? '魔道煞氣入體，攻擊永久+25！' : ''}`,
      'gold'
    );
  };

  const handleDoSectMission = () => {
    if (!player.sect) return;
    const nextAge = player.age + (Math.random() < 0.25 ? 1 : 0);
    if (nextAge >= player.maxAge) {
      setDeathReason(`享年 ${nextAge} 歲，執行宗門任務時大限降臨，坐化歸西！`);
      return;
    }

    setPlayer((p) => ({
      ...p,
      age: nextAge,
      exp: p.exp + 90,
      gold: p.gold + 120,
      sect: p.sect ? { ...p.sect, points: p.sect.points + 50 } : null,
    }));

    addLog(
      `📜 你圓滿完成了宗門降妖懸賞！獲賜 50 點宗門貢獻、90 點修為與 120 靈石！`,
      'cyan'
    );
  };

  const handleClaimSalary = () => {
    if (!player.sect) return;
    let amt =
      player.sect.rank === '掌門至尊'
        ? 1500
        : player.sect.rank.includes('長老')
        ? 600
        : 200;

    setPlayer((p) => ({
      ...p,
      gold: p.gold + amt,
    }));

    addLog(`💰 領取了本月【${player.sect.name}】發放之修行供奉靈石 +${amt}！`, 'gold');
  };

  const handlePromoteRank = () => {
    if (!player.sect) return;
    const rankProgression: SectRank[] = [
      '外門弟子',
      '內門弟子',
      '執事長老',
      '宗門長老',
      '掌門至尊',
    ];
    const currentIdx = rankProgression.indexOf(player.sect.rank);
    if (currentIdx >= rankProgression.length - 1) return;

    const nextRank = rankProgression[currentIdx + 1];
    const costPts = (currentIdx + 1) * 200;

    if (player.sect.points < costPts) {
      alert(`宗門貢獻不足 ${costPts} 點，無法晉升！`);
      return;
    }

    sound.playBreakthrough();
    setPlayer((p) => ({
      ...p,
      atk: p.atk + 35,
      sect: p.sect
        ? {
            ...p.sect,
            rank: nextRank,
            points: p.sect.points - costPts,
          }
        : null,
    }));

    addLog(
      `🎖️ 宗門演武大比技驚四座！你力壓群雄晉升為【${nextRank}】！威震同門，攻擊永久 +35！`,
      'gold'
    );
  };

  const handleBuyScriptureItem = (item: Item, ptsCost: number) => {
    if (!player.sect || player.sect.points < ptsCost) {
      alert('宗門貢獻不足！');
      return;
    }

    setPlayer((p) => ({
      ...p,
      inventory: [...p.inventory, item],
      sect: p.sect ? { ...p.sect, points: p.sect.points - ptsCost } : null,
    }));

    addLog(
      `📜 你憑藉宗門貢獻於藏經閣換取了【${item.name}】，已存入儲物仙戒！`,
      'gold'
    );
  };

  // --- Cross-Server Immortal Alliance Handlers ---
  const handleFoundAlliance = (name: string, motto: string, crest: string) => {
    if (player.gold < 1000) {
      alert('靈石不足 1,000！');
      return;
    }

    const newAlliance: ImmortalAlliance = {
      id: `alliance_${Date.now()}`,
      name,
      level: 1,
      motto: motto || '天地不仁，萬仙同心！',
      crest: crest || '🐉',
      role: '盟主',
      membersCount: 8,
      totalPower: 15800 + player.atk * 10,
      serverOrigin: '【永寧1服】',
      funds: 3000,
      spiritArrayLevel: 1,
      warArrayLevel: 1,
      treasuryLevel: 1,
      members: [
        {
          id: 'mem_player',
          name: player.name,
          server: '【永寧1服】',
          realmName: REALMS[player.realmIdx].name,
          combatPower: player.atk * 15 + player.def * 10,
          role: '盟主',
          contribution: 500,
          isPlayer: true,
        },
        {
          id: 'mem_1',
          name: '天劍散仙·劍無塵',
          server: '【華封2服】',
          realmName: '具靈初期',
          combatPower: 5800,
          role: '副盟主',
          contribution: 320,
        },
        {
          id: 'mem_2',
          name: '丹霞仙子·阮雲舒',
          server: '【雲陌3服】',
          realmName: '金丹圓滿',
          combatPower: 3400,
          role: '護法長老',
          contribution: 280,
        },
        {
          id: 'mem_3',
          name: '九幽狂魔·厲黑煞',
          server: '【幽冥跨界服】',
          realmName: '金丹後期',
          combatPower: 2600,
          role: '征戰先鋒',
          contribution: 210,
        },
        {
          id: 'mem_4',
          name: '妙音真君·林水月',
          server: '【天元界】',
          realmName: '築基圓滿',
          combatPower: 1200,
          role: '盟眾',
          contribution: 150,
        },
      ],
    };

    setPlayer((p) => ({
      ...p,
      gold: p.gold - 1000,
      alliance: newAlliance,
    }));

    addLog(
      `👑 宏願開闢！你於八荒正式創立跨服仙盟【${name}】，手持盟主大印，號令各界仙修道友！`,
      'gold'
    );
  };

  const handleJoinRivalAlliance = (rival: RivalAlliance) => {
    const joinedAlliance: ImmortalAlliance = {
      id: rival.id,
      name: rival.name,
      level: 2,
      motto: rival.motto,
      crest: '⚡',
      role: '護法長老',
      membersCount: 15,
      totalPower: rival.power,
      serverOrigin: rival.server,
      funds: 8000,
      spiritArrayLevel: 2,
      warArrayLevel: 2,
      treasuryLevel: 2,
      members: [
        {
          id: 'mem_leader',
          name: rival.leader,
          server: rival.server,
          realmName: '化神大圓滿',
          combatPower: Math.floor(rival.power * 0.4),
          role: '盟主',
          contribution: 1800,
        },
        {
          id: 'mem_player',
          name: player.name,
          server: '【本服】',
          realmName: REALMS[player.realmIdx].name,
          combatPower: player.atk * 15 + player.def * 10,
          role: '護法長老',
          contribution: 300,
          isPlayer: true,
        },
        {
          id: 'mem_vice',
          name: '青龍真君',
          server: rival.server,
          realmName: '元嬰後期',
          combatPower: 8200,
          role: '副盟主',
          contribution: 950,
        },
      ],
    };

    setPlayer((p) => ({ ...p, alliance: joinedAlliance }));

    addLog(
      `🤝 你已率部依附拜入跨服仙盟【${rival.name}】(${rival.server})，被尊奉為【護法長老】！`,
      'cyan'
    );
  };

  const handleConquerTerritory = (territory: DomainTerritory) => {
    if (!player.alliance) {
      alert('尚未加入跨服仙盟，無法宣戰爭奪領地！');
      return;
    }

    setPendingConquerTerritoryId(territory.id);

    const enemy: Enemy = {
      id: `champ_${territory.id}`,
      name: territory.championName,
      title: `${territory.ownerAllianceName} 鎮守大能`,
      realmName: territory.recommendedRealm,
      hp: territory.championHp,
      maxHp: territory.championHp,
      atk: territory.championAtk,
      def: territory.championDef,
      isCultivator: true,
      dropGold: territory.weeklyTaxGold,
    };

    addLog(
      `🚩 萬界同盟遠征！你率領跨服仙盟兵臨【${territory.name}】，挑戰守關大能【${territory.championName}】奪取領地稅權！`,
      'red'
    );

    setActiveBattleEnemy(enemy);
  };

  const handleCollectTaxes = (territoryId?: string) => {
    if (!player.alliance) return;

    let totalStones = 0;
    const gainedItems: Item[] = [];
    let collectedCount = 0;

    const updatedTerritories = territories.map((t) => {
      const match = territoryId ? t.id === territoryId : t.ownerAllianceName === player.alliance?.name;
      if (match && t.unclaimedTaxGold > 0) {
        collectedCount++;
        let effectiveTax = t.unclaimedTaxGold;
        if (t.appointedEnvoy?.roleType === 'tax_commissioner') {
          effectiveTax = Math.floor(effectiveTax * 1.3);
        }
        // Treasury Efficiency Tech buff: +20% tax income per treasury level
        if (player.alliance?.treasuryLevel) {
          effectiveTax = Math.floor(effectiveTax * (1 + player.alliance.treasuryLevel * 0.2));
        }
        totalStones += effectiveTax;

        // Give associated rewards based on domain
        if (t.id === 'domain_yongning') {
          gainedItems.push(CONSUMABLE_PILLS[2]); // 聚元化靈丹
        } else if (t.id === 'domain_leize') {
          gainedItems.push(BREAKTHROUGH_ITEMS[1]); // 九品金丹靈珠
        } else if (t.id === 'domain_huafeng') {
          gainedItems.push(BREAKTHROUGH_ITEMS[2]); // 具靈仙芝
          gainedItems.push(CONSUMABLE_PILLS[3]); // 延壽丹
        } else if (t.id === 'domain_yunmo') {
          gainedItems.push(BREAKTHROUGH_ITEMS[3]); // 元嬰天髓
        } else if (t.id === 'domain_zhongzhou') {
          gainedItems.push(BREAKTHROUGH_ITEMS[5]); // 鴻蒙道果
        }

        return {
          ...t,
          unclaimedTaxGold: 0,
          unclaimedResourceCount: 0,
        };
      }
      return t;
    });

    if (totalStones === 0) {
      alert('該重鎮目前尚無累積稅款，請待歲月推移或週日結算！');
      return;
    }

    const gainedContrib = collectedCount * 50;

    sound.playCoin();
    setTerritories(updatedTerritories);
    setPlayer((p) => ({
      ...p,
      gold: p.gold + totalStones,
      inventory: [...p.inventory, ...gainedItems],
      alliance: p.alliance
        ? {
            ...p.alliance,
            members: p.alliance.members.map((m) =>
              m.isPlayer ? { ...m, contribution: m.contribution + gainedContrib } : m
            ),
          }
        : null,
    }));

    addLog(
      `💰 順利徵收八荒領地歲稅！獲取靈石 +${totalStones.toLocaleString()} (含金庫賦稅加成)，榮立仙盟戰功 +${gainedContrib} 點，並徵納繳獲天材地寶【${gainedItems.map((i) => i.name).join('、')}】！`,
      'gold'
    );

    const territoryName = territoryId
      ? territories.find((t) => t.id === territoryId)?.name || '專屬領地'
      : `八荒所轄重鎮 (${updatedTerritories.filter((t) => t.ownerAllianceName === player.alliance?.name).length} 處)`;

    addDiplomaticLog(
      'tax',
      territoryName,
      `順利清點並徵納領地歲稅歸庫`,
      `巡察仙官奉盟主法旨整頓稅賦，清點靈礦收益與靈藥產出，悉數押解歸仙盟金庫。`,
      `議稅巡查特使 / 盟主`,
      `庫藏增盈 +${totalStones.toLocaleString()} 靈石，徵收解送天材地寶【${gainedItems.map((i) => i.name).join('、')}】`
    );
  };

  const handleAppointEnvoy = (
    territoryId: string,
    memberId: string,
    roleType: DiplomaticRoleType
  ) => {
    if (!player.alliance) return;
    const member = player.alliance.members.find((m) => m.id === memberId);
    const territory = territories.find((t) => t.id === territoryId);
    if (!member || !territory) return;

    let title = '領地聯防長老';
    let bonusDesc = '護盾上限+50% · 守城防禦激增';

    if (roleType === 'tax_commissioner') {
      title = '議稅巡查特使';
      bonusDesc = '每週歲稅+30% · 材料雙倍產出';
    } else if (roleType === 'negotiator') {
      title = '萬界談判使節';
      bonusDesc = '跨界盟約 · 防備突襲';
    }

    // Update territory
    setTerritories((prev) =>
      prev.map((t) => {
        if (t.id === territoryId) {
          let maxShield = t.maxShieldHp;
          let curShield = t.shieldHp;
          if (roleType === 'defense_envoy') {
            maxShield = Math.floor(maxShield * 1.5);
            curShield = maxShield;
          }
          return {
            ...t,
            maxShieldHp: maxShield,
            shieldHp: curShield,
            appointedEnvoy: {
              memberId: member.id,
              memberName: member.name,
              roleType,
              title,
              bonusDesc,
            },
          };
        }
        return t;
      })
    );

    // Update member
    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        alliance: {
          ...p.alliance,
          members: p.alliance.members.map((m) =>
            m.id === memberId
              ? { ...m, assignedTerritoryId: territoryId, assignedRoleTitle: title }
              : m.assignedTerritoryId === territoryId
              ? { ...m, assignedTerritoryId: null, assignedRoleTitle: null }
              : m
          ),
        },
      };
    });

    addLog(
      `📜 仙盟法旨：盟主正式委派【${member.name}】出任【${territory.name}】之【${title}】！${bonusDesc}！`,
      'gold'
    );

    const cat: DiplomaticLogCategory =
      roleType === 'negotiator' ? 'negotiation' : roleType === 'tax_commissioner' ? 'tax' : 'defense';

    addDiplomaticLog(
      cat,
      territory.name,
      `委派【${member.name}】出任【${title}】`,
      `經仙盟高層決議，盟主正式委任【${member.name}】(${member.server} · ${member.realmName}) 坐鎮【${territory.name}】，執掌專門外交與聯防事務。`,
      `盟主 ${player.name}`,
      bonusDesc
    );
  };

  const handleRecallEnvoy = (territoryId: string) => {
    const territory = territories.find((t) => t.id === territoryId);
    if (!territory) return;

    setTerritories((prev) =>
      prev.map((t) => (t.id === territoryId ? { ...t, appointedEnvoy: null } : t))
    );

    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        alliance: {
          ...p.alliance,
          members: p.alliance.members.map((m) =>
            m.assignedTerritoryId === territoryId
              ? { ...m, assignedTerritoryId: null, assignedRoleTitle: null }
              : m
          ),
        },
      };
    });

    addLog(`📜 召回了【${territory.name}】之外交鎮守特使，道友返回仙盟總舵。`, 'cyan');

    addDiplomaticLog(
      'appointment',
      territory.name,
      `召回【${territory.name}】駐防外交特使`,
      `仙盟總舵下達調令，駐防外交長老任務圓滿告竣，返回總舵聽調，該重鎮恢復常規巡哨體系。`,
      `盟主 ${player.name}`,
      `特使職責解除，相關加成回歸初始基準`
    );
  };

  const handleUpgradeFortification = (territoryId: string) => {
    const territory = territories.find((t) => t.id === territoryId);
    if (!territory) return;

    const nextTier = FORTIFICATION_TIERS.find((f) => f.level === territory.fortificationLevel + 1);
    if (!nextTier) {
      alert('該領地防禦工事已達頂峰！');
      return;
    }

    const treasuryFunds = player.alliance?.funds || 0;
    let spentFromTreasury = false;

    // Elders prioritize spending from Alliance Treasury Funds
    if (player.alliance && treasuryFunds >= nextTier.cost) {
      spentFromTreasury = true;
      setPlayer((p) => {
        if (!p.alliance) return p;
        return {
          ...p,
          alliance: {
            ...p.alliance,
            funds: p.alliance.funds - nextTier.cost,
          },
        };
      });
    } else if (player.gold >= nextTier.cost) {
      setPlayer((p) => ({ ...p, gold: p.gold - nextTier.cost }));
    } else {
      alert(
        `金庫資金不足 (${treasuryFunds.toLocaleString()}/${nextTier.cost.toLocaleString()})，長老個人靈石亦不足，無法加固防禦工事！`
      );
      return;
    }

    sound.playBreakthrough();

    // Update territory
    setTerritories((prev) =>
      prev.map((t) => {
        if (t.id === territoryId) {
          let shieldBase = nextTier.shieldHp;
          if (t.appointedEnvoy?.roleType === 'defense_envoy') {
            shieldBase = Math.floor(shieldBase * 1.5);
          }
          return {
            ...t,
            fortificationLevel: nextTier.level,
            fortificationName: nextTier.name,
            maxShieldHp: shieldBase,
            shieldHp: shieldBase,
          };
        }
        return t;
      })
    );

    const fundSourceText = spentFromTreasury ? '動用【仙盟金庫儲備】' : '長老撥付個人靈石';

    addLog(
      `🛡️ 長老${fundSourceText} ${nextTier.cost.toLocaleString()} 靈石加固【${territory.name}】防禦工事！大陣升級至【${nextTier.name}】(Lv.${nextTier.level})，護盾上限大幅提升至 ${nextTier.shieldHp.toLocaleString()} HP！`,
      'gold'
    );

    addDiplomaticLog(
      'defense',
      territory.name,
      `防禦工事晉階【${nextTier.name}】(Lv.${nextTier.level})`,
      `長老${fundSourceText} ${nextTier.cost.toLocaleString()} 靈石加固【${territory.name}】防禦壁障，護盾大幅增厚，為領地爭奪戰提供強大抗性。`,
      `領地聯防長老 / 盟主`,
      `護盾上限飛躍至 ${nextTier.shieldHp.toLocaleString()} HP，在跨服爭奪戰中抵禦敵盟攻勢`
    );
  };

  const handleRepairShield = (territoryId: string) => {
    const territory = territories.find((t) => t.id === territoryId);
    if (!territory) return;

    const cost = 300;
    const treasuryFunds = player.alliance?.funds || 0;
    let spentFromTreasury = false;

    if (player.alliance && treasuryFunds >= cost) {
      spentFromTreasury = true;
      setPlayer((p) => {
        if (!p.alliance) return p;
        return {
          ...p,
          alliance: {
            ...p.alliance,
            funds: p.alliance.funds - cost,
          },
        };
      });
    } else if (player.gold >= cost) {
      setPlayer((p) => ({ ...p, gold: p.gold - cost }));
    } else {
      alert('金庫與個人靈石不足 300，無法注入真元修復護盾！');
      return;
    }

    sound.playDing();

    setTerritories((prev) =>
      prev.map((t) => (t.id === territoryId ? { ...t, shieldHp: t.maxShieldHp } : t))
    );

    const fundSourceText = spentFromTreasury ? '動用金庫公款' : '消耗個人靈石';

    addLog(`✨ 長老${fundSourceText}注入真元靈晶，【${territory.name}】之護盾防護法陣完全修復充盈！`, 'cyan');

    addDiplomaticLog(
      'defense',
      territory.name,
      `真元灌注修復【${territory.name}】護盾法陣`,
      `值守長老${fundSourceText}調撥真元靈晶充盈護山陣眼，受損禁制光幕悉數撫平彌合，回歸全盛抵禦姿態。`,
      `領地聯防長老`,
      `護盾法陣修復至 ${territory.maxShieldHp.toLocaleString()} HP，防備宵小突襲`
    );
  };

  const handleDonateTreasury = (amount: number) => {
    if (!player.alliance) return;
    if (player.gold < amount) {
      alert(`個人靈石不足 ${amount.toLocaleString()}！無法向金庫撥款！`);
      return;
    }

    sound.playCoin();
    // Award 25% of donated amount as contribution points
    const gainedContribution = Math.floor(amount * 0.25);

    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        gold: p.gold - amount,
        alliance: {
          ...p.alliance,
          funds: p.alliance.funds + amount,
          members: p.alliance.members.map((m) =>
            m.isPlayer ? { ...m, contribution: m.contribution + gainedContribution } : m
          ),
        },
      };
    });

    addLog(
      `💰 長老撥款：你向仙盟金庫注資 +${amount.toLocaleString()} 靈石，獲授仙盟戰功 +${gainedContribution} 點！資金用於八荒領地防禦工事與科技研發！`,
      'gold'
    );

    addDiplomaticLog(
      'tax',
      '仙盟總舵金庫',
      `長老撥款注資金庫 ${amount.toLocaleString()} 靈石`,
      `仙盟長老調撥修行資產充盈金庫，確保全域領地防禦工事加固與天道科技研發公款充裕，獲賜戰功點數。`,
      `長老 ${player.name}`,
      `金庫儲備大幅增盈 +${amount.toLocaleString()} 靈石，個人獲得戰功 +${gainedContribution} 點`
    );
  };

  const handleUpgradeAllianceTech = (
    techType: 'spirit' | 'war' | 'treasury',
    costGold?: number,
    costContribution?: number,
    techName?: string,
    tierLevel?: number
  ) => {
    if (!player.alliance) return;

    const currentLevel =
      techType === 'spirit'
        ? player.alliance.spiritArrayLevel
        : techType === 'war'
        ? player.alliance.warArrayLevel
        : player.alliance.treasuryLevel;

    const targetLevel = tierLevel !== undefined ? tierLevel : currentLevel + 1;
    const finalCostGold =
      costGold !== undefined
        ? costGold
        : techType === 'spirit'
        ? currentLevel * 2000
        : techType === 'war'
        ? currentLevel * 2500
        : currentLevel * 3000;

    const finalCostContrib =
      costContribution !== undefined ? costContribution : currentLevel * 100;

    const playerMember =
      player.alliance.members.find((m) => m.isPlayer) || player.alliance.members[0];
    const playerContribution = playerMember ? playerMember.contribution : 0;

    if (player.gold < finalCostGold) {
      alert(`修仙資產靈石不足 (${player.gold.toLocaleString()}/${finalCostGold.toLocaleString()})，無法參研仙盟科技！`);
      return;
    }

    if (playerContribution < finalCostContrib) {
      alert(
        `仙盟戰功/貢獻點不足 (${playerContribution}/${finalCostContrib})！可透過「八荒領地巡守」、「向金庫注資撥款」或「徵收重鎮歲稅」快速積累戰功！`
      );
      return;
    }

    sound.playBreakthrough();

    const techTitle =
      techName ||
      (techType === 'spirit'
        ? `聚靈通天大陣 (Lv.${targetLevel})`
        : techType === 'war'
        ? `誅仙戮魔戰陣 (Lv.${targetLevel})`
        : `八荒乾坤金庫 (Lv.${targetLevel})`);

    const atkGain = techType === 'war' ? 60 : 0;
    const defGain = techType === 'war' ? 30 : 0;

    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        gold: p.gold - finalCostGold,
        atk: p.atk + atkGain,
        def: p.def + defGain,
        alliance: {
          ...p.alliance,
          totalPower: p.alliance.totalPower + (techType === 'war' ? 1500 : 800),
          spiritArrayLevel: techType === 'spirit' ? targetLevel : p.alliance.spiritArrayLevel,
          warArrayLevel: techType === 'war' ? targetLevel : p.alliance.warArrayLevel,
          treasuryLevel: techType === 'treasury' ? targetLevel : p.alliance.treasuryLevel,
          members: p.alliance.members.map((m) =>
            m.isPlayer
              ? { ...m, contribution: Math.max(0, m.contribution - finalCostContrib) }
              : m
          ),
        },
      };
    });

    const impactDesc =
      techType === 'spirit'
        ? `全盟修為獲取倍率提升至 +${targetLevel * 15}%，洞府閉關與日常歷練效率大增`
        : techType === 'war'
        ? `全體同修永久攻擊 +${atkGain}、防禦 +${defGain}，跨服爭奪戰攻防實力飛躍`
        : `八荒領地歲稅收益倍率提升至 +${targetLevel * 20}%，金庫財庫滾滾充盈`;

    addLog(
      `✨ 仙盟科技天道大成！你耗費 ${finalCostGold.toLocaleString()} 靈石與 ${finalCostContrib} 點仙盟戰功，成功參悟研發【${techTitle}】！${impactDesc}！`,
      'gold'
    );

    addDiplomaticLog(
      techType === 'treasury' ? 'tax' : techType === 'war' ? 'defense' : 'negotiation',
      '仙殿天道科技閣',
      `成功參悟仙盟科技【${techTitle}】`,
      `仙盟成員共同參研天道法旨，消耗大量靈石與戰功點亮全新陣眼符文，全盟仙陣威能躍居諸天萬界前列。`,
      `研發長老 ${player.name}`,
      impactDesc
    );
  };

  const handleAlliancePatrolTask = () => {
    if (!player.alliance) return;
    sound.playDing();
    const gainedContrib = 150;
    const gainedGold = 600 + Math.floor(Math.random() * 400);

    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        gold: p.gold + gainedGold,
        alliance: {
          ...p.alliance,
          members: p.alliance.members.map((m) =>
            m.isPlayer ? { ...m, contribution: m.contribution + gainedContrib } : m
          ),
        },
      };
    });

    addLog(
      `🚩 八荒巡守立功：你奉仙盟法旨巡查八荒領地邊境，驅逐越境窺伺的魔道散修，獲賜仙盟戰功 +${gainedContrib} 點，賞賜靈石 +${gainedGold}！`,
      'gold'
    );
  };

  // --- Alliance Scripture Library Handler ---
  const handleUnlockScripture = (scriptureId: string, costContrib: number) => {
    if (!player.alliance) {
      alert('道友尚未加入或開創仙盟，無法參悟仙盟藏經閣道藏！');
      return;
    }

    const playerMember =
      player.alliance.members.find((m) => m.isPlayer) || player.alliance.members[0];
    const playerContribution = playerMember ? playerMember.contribution : 0;

    if (playerContribution < costContrib) {
      alert(
        `仙盟戰功/貢獻點不足 (${playerContribution}/${costContrib})！可透過「八荒領地巡守」、「向金庫注資撥款」或「徵收重鎮歲稅」快速積累戰功！`
      );
      return;
    }

    const scripture = ALLIANCE_SCRIPTURES.find((s) => s.id === scriptureId);
    if (!scripture) return;

    const currentLevel = player.unlockedScriptures?.[scriptureId] || 0;
    if (currentLevel >= scripture.maxLevel) {
      alert('此本無上道藏已參悟至最高重天大圓滿！');
      return;
    }

    const nextLevel = currentLevel + 1;
    sound.playBreakthrough();

    // If scripture is bonus_lifespan, extend maxAge
    const extraLifespan = scripture.effectType === 'bonus_lifespan' ? scripture.valuePerLevel : 0;

    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        maxAge: p.maxAge + extraLifespan,
        unlockedScriptures: {
          ...(p.unlockedScriptures || {}),
          [scriptureId]: nextLevel,
        },
        alliance: {
          ...p.alliance,
          members: p.alliance.members.map((m) =>
            m.isPlayer ? { ...m, contribution: m.contribution - costContrib } : m
          ),
        },
      };
    });

    const effectText =
      scripture.effectType === 'crit_chance'
        ? `暴擊機率提升至 +${nextLevel * scripture.valuePerLevel}%`
        : scripture.effectType === 'meditation_exp'
        ? `洞府閉關修為提升至 +${nextLevel * scripture.valuePerLevel}%`
        : scripture.effectType === 'crit_damage'
        ? `暴擊致命傷害倍率提升至 +${nextLevel * scripture.valuePerLevel}%`
        : scripture.effectType === 'damage_reduction'
        ? `生死鬥法傷害減免提升至 +${nextLevel * scripture.valuePerLevel}%`
        : scripture.effectType === 'bonus_lifespan'
        ? `修士壽元上限永久延長 +${scripture.valuePerLevel} 年 (累計 +${nextLevel * scripture.valuePerLevel} 年)`
        : `歷練搜刮靈石量提升至 +${nextLevel * scripture.valuePerLevel}%`;

    addLog(
      `📜 【仙盟藏經閣】：你消耗 ${costContrib} 點仙盟戰功，成功參悟【${scripture.name}】至【第 ${nextLevel} 重】！解鎖永久被動神通：${effectText}！`,
      'gold'
    );

    addDiplomaticLog(
      'defense',
      '仙盟天道藏經閣',
      `同盟長老參透【${scripture.name}】第 ${nextLevel} 重`,
      `同修以卓越之仙盟貢獻與戰功入閣參道，悟透上古殘卷，仙道神通大進，護持全盟道統。`,
      `長老 ${player.name}`,
      `道法精進：${effectText}`
    );
  };

  // --- Alliance Merit Shop Handler ---
  const handleBuyMeritShopItem = (shopItemId: string) => {
    if (!player.alliance) {
      alert('道友尚未加入或開創仙盟，無法開啟仙盟戰功商店！');
      return;
    }

    const shopItem = ALLIANCE_MERIT_SHOP_ITEMS.find((item) => item.id === shopItemId);
    if (!shopItem) return;

    const playerMember =
      player.alliance.members.find((m) => m.isPlayer) || player.alliance.members[0];
    const playerContribution = playerMember ? playerMember.contribution : 0;

    const boughtCount = player.meritShopPurchases?.[shopItemId] || 0;
    if (boughtCount >= shopItem.stockLimit) {
      alert(`【${shopItem.name}】本週期限量庫存已兌罄（限量 ${shopItem.stockLimit} 次）！`);
      return;
    }

    if (playerContribution < shopItem.costContribution) {
      alert(
        `仙盟戰功不足 (${playerContribution}/${shopItem.costContribution})！可透過「八荒領地巡守」、「向金庫注資撥款」或「徵收重鎮歲稅」快速積累戰功！`
      );
      return;
    }

    sound.playCoin();

    setPlayer((p) => {
      if (!p.alliance) return p;
      return {
        ...p,
        inventory: [...p.inventory, shopItem.item],
        meritShopPurchases: {
          ...(p.meritShopPurchases || {}),
          [shopItemId]: boughtCount + 1,
        },
        alliance: {
          ...p.alliance,
          members: p.alliance.members.map((m) =>
            m.isPlayer ? { ...m, contribution: m.contribution - shopItem.costContribution } : m
          ),
        },
      };
    });

    addLog(
      `🏪 【仙盟戰功商店】：你消耗 ${shopItem.costContribution} 點仙盟戰功，成功兌換了稀世至寶【${shopItem.name}】！寶物已納入儲物仙戒！`,
      'gold'
    );

    addDiplomaticLog(
      'tax',
      '仙盟天道秘庫',
      `同盟長老以戰功兌得【${shopItem.name}】`,
      `長老積累赫赫戰功，依仙盟規條自秘庫支取限量稀世修煉資源，犒賞修仙道果。`,
      `長老 ${player.name}`,
      `消耗戰功 ${shopItem.costContribution} 點，換取稀有靈寶入囊`
    );
  };

  // --- Cave Abode Meditation ---
  const handleMeditate = (years: number) => {
    const nextAge = player.age + years;
    if (nextAge >= player.maxAge) {
      setDeathReason(`享年 ${player.maxAge} 歲，於洞府入定百年中大限坐化，肉身羽化！`);
      return;
    }

    // Accumulate territory taxes over seclusion
    accumulateTerritoryTaxes(years);

    // Spirit Array Tech buff + Alliance Scripture bonus exp from meditation
    const spiritMultiplier = 1 + (player.alliance?.spiritArrayLevel || 0) * 0.15;
    const scriptureMeditateLevel = player.unlockedScriptures?.['scripture_meditate_exp'] || 0;
    const scriptureExpMultiplier = 1 + scriptureMeditateLevel * 0.25;
    const expMultiplier = spiritMultiplier * scriptureExpMultiplier;

    let gainExp = Math.floor(years * 35 * (1 + player.int / 100) * expMultiplier);
    if (years === 10) gainExp = Math.floor(400 * (1 + player.int / 100) * expMultiplier);
    if (years === 100) gainExp = Math.floor(4500 * (1 + player.int / 100) * expMultiplier);

    setPlayer((p) => ({
      ...p,
      age: nextAge,
      hp: p.maxHp,
      exp: p.exp + gainExp,
    }));

    sound.playBreakthrough();
    const scriptureBonusText =
      scriptureMeditateLevel > 0
        ? ` (藏經閣《太虛吐納真經》+${scriptureMeditateLevel * 25}% 修為加成)`
        : '';
    addLog(
      `🧘 洞府入定 ${years} 載！周天靈氣源源入體，氣血創傷完全撫平，獲取修為 +${gainExp} 點！${scriptureBonusText}(領地歲稅持續累積)`,
      'cyan'
    );
  };

  // --- Bag Item Usages ---
  const handleUseItem = (index: number) => {
    const item = player.inventory[index];
    if (!item) return;

    let logMsg = '';

    setPlayer((p) => {
      let nextInv = [...p.inventory];
      nextInv.splice(index, 1); // Consume item

      let nextHp = p.hp;
      let nextMaxHp = p.maxHp;
      let nextExp = p.exp;
      let nextAtk = p.atk;
      let nextDef = p.def;
      let nextInt = p.int;
      let nextMaxAge = p.maxAge;
      let nextDestinies = [...p.destinies];

      if (item.id === 'item_tiandao_zhuji_dan') {
        nextMaxHp += 200;
        nextHp = Math.min(nextMaxHp, nextHp + 800);
        logMsg = `🔮 服用【天道築基丹】！天道地道造化神髓入體，氣血上限永久 +200，真元暴漲 +800 點！`;
      }

      if (item.id === 'item_destiny_reset_scroll') {
        const unlearnedDestinies = ALL_DESTINIES.filter(
          (d) => !p.destinies.some((pd) => pd.id === d.id)
        );
        if (unlearnedDestinies.length > 0) {
          const picked = unlearnedDestinies[Math.floor(Math.random() * unlearnedDestinies.length)];
          nextDestinies = [...p.destinies, picked];
          logMsg = `📜 祭出【領悟點數重置券】引動天命逆轉！大道轟鳴，額外領悟了無上神通【${picked.name}】(${picked.desc})！`;
        } else {
          logMsg = `📜 祭出【領悟點數重置券】洗鍊道心，悟性暴增 +30，天命壽元延長 +10 年！`;
        }
      }

      if (item.effect?.healHp && item.id !== 'item_tiandao_zhuji_dan') {
        nextHp = Math.min(nextMaxHp, nextHp + item.effect.healHp);
        logMsg = `吞服了【${item.name}】，傷勢撫平，氣血恢復 +${item.effect.healHp} 點！`;
      }
      if (item.effect?.addExp && item.id !== 'item_tiandao_zhuji_dan') {
        nextExp += item.effect.addExp;
        logMsg = `吞服【${item.name}】，腹中湧起磅礴靈力，修為暴漲 +${item.effect.addExp} 點！`;
      }
      if (item.effect?.addAtk) {
        nextAtk += item.effect.addAtk;
        logMsg = `修習參悟【${item.name}】，劍意通玄，攻擊力永久提升 +${item.effect.addAtk} 點！`;
      }
      if (item.effect?.addDef) {
        nextDef += item.effect.addDef;
        logMsg += ` 防禦力提升 +${item.effect.addDef} 點！`;
      }
      if (item.effect?.addInt && item.id !== 'item_destiny_reset_scroll') {
        nextInt += item.effect.addInt;
        logMsg += ` 悟性提升 +${item.effect.addInt} 點！`;
      }
      if (item.effect?.addLifespan && item.id !== 'item_destiny_reset_scroll') {
        nextMaxAge += item.effect.addLifespan;
        logMsg = `吞服神丹【${item.name}】，逆天奪命，壽元上限延長 +${item.effect.addLifespan} 年！`;
      }

      return {
        ...p,
        hp: nextHp,
        maxHp: nextMaxHp,
        exp: nextExp,
        atk: nextAtk,
        def: nextDef,
        int: nextInt,
        maxAge: nextMaxAge,
        destinies: nextDestinies,
        inventory: nextInv,
      };
    });

    if (logMsg) {
      addLog(`✨ ${logMsg}`, 'gold');
    }
  };

  const handleSellItem = (index: number) => {
    const item = player.inventory[index];
    if (!item) return;

    const gain = item.price || 50;

    setPlayer((p) => {
      let nextInv = [...p.inventory];
      nextInv.splice(index, 1);
      return {
        ...p,
        gold: p.gold + gain,
        inventory: nextInv,
      };
    });

    addLog(`💰 將【${item.name}】變賣予山海遊商，獲得靈石 +${gain}。`, 'cyan');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0f15] text-slate-200 select-none">
      {/* Top Header */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        bagCount={player.inventory.length}
        hasAlliance={!!player.alliance}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace (Sidebar + Main Stage) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <CharacterSidebar
          player={player}
          onOpenBreakthrough={() => setIsBreakthroughOpen(true)}
        />

        {/* Center / Right Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#10131b]">
          {/* Mobile Tab Navigation Bar */}
          <div className="md:hidden flex items-center justify-around bg-[#121620] border-b border-slate-800 p-2 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-2 py-1 rounded font-bold whitespace-nowrap ${activeTab === 'explore' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              🗺️ 探索
            </button>
            <button
              onClick={() => setActiveTab('auction')}
              className={`px-2 py-1 rounded font-bold whitespace-nowrap ${activeTab === 'auction' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              🏛️ 拍賣
            </button>
            <button
              onClick={() => setActiveTab('sect')}
              className={`px-2 py-1 rounded font-bold whitespace-nowrap ${activeTab === 'sect' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              ⛩️ 宗門
            </button>
            <button
              onClick={() => {
                sound.playWarDrum();
                setActiveTab('alliance');
              }}
              className={`px-2 py-1 rounded font-bold whitespace-nowrap ${activeTab === 'alliance' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              ⚔️ 仙盟
            </button>
            <button
              onClick={() => setActiveTab('meditate')}
              className={`px-2 py-1 rounded font-bold whitespace-nowrap ${activeTab === 'meditate' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              🧘 閉關
            </button>
            <button
              onClick={() => setActiveTab('bag')}
              className={`px-2 py-1 rounded font-bold whitespace-nowrap ${activeTab === 'bag' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              🎒 儲物({player.inventory.length})
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === 'explore' && (
              <ExploreTab
                player={player}
                onExploreRegion={handleExploreRegion}
                onTriggerRandomEvent={handleTriggerRandomEvent}
              />
            )}

            {activeTab === 'auction' && (
              <AuctionTab
                player={player}
                auctionList={auctionList}
                onBid={handleBidAuction}
                onAmbush={handleAmbushAuction}
                onRefreshAuction={handleRefreshAuction}
              />
            )}

            {activeTab === 'sect' && (
              <SectTab
                player={player}
                onJoinSect={handleJoinSect}
                onDoSectMission={handleDoSectMission}
                onClaimSalary={handleClaimSalary}
                onPromoteRank={handlePromoteRank}
                onBuyScriptureItem={handleBuyScriptureItem}
              />
            )}

            {activeTab === 'alliance' && (
              <AllianceTab
                player={player}
                territories={territories}
                rivalAlliances={rivalAlliances}
                diplomaticLogs={diplomaticLogs}
                onFoundAlliance={handleFoundAlliance}
                onJoinRivalAlliance={handleJoinRivalAlliance}
                onConquerTerritory={handleConquerTerritory}
                onCollectTaxes={handleCollectTaxes}
                onUpgradeTech={handleUpgradeAllianceTech}
                onAppointEnvoy={handleAppointEnvoy}
                onRecallEnvoy={handleRecallEnvoy}
                onUpgradeFortification={handleUpgradeFortification}
                onRepairShield={handleRepairShield}
                onIssueDiplomaticDecree={handleIssueDiplomaticDecree}
                onDonateTreasury={handleDonateTreasury}
                onAlliancePatrol={handleAlliancePatrolTask}
                onUnlockScripture={handleUnlockScripture}
                onBuyMeritItem={handleBuyMeritShopItem}
              />
            )}

            {activeTab === 'meditate' && (
              <MeditateTab player={player} onMeditate={handleMeditate} />
            )}

            {activeTab === 'bag' && (
              <BagTab
                player={player}
                onUseItem={handleUseItem}
                onSellItem={handleSellItem}
              />
            )}
          </div>

          {/* Bottom Chronicle Log */}
          <LogPanel logs={logs} onClearLogs={() => setLogs([])} />
        </main>
      </div>

      {/* --- Modals --- */}
      {isCreateOpen && <CreateModal onStartGame={handleStartGame} />}

      {isBreakthroughOpen && (
        <BreakthroughModal
          player={player}
          onClose={() => setIsBreakthroughOpen(false)}
          onBreakthroughSuccess={handleBreakthroughSuccess}
          onTribulationDefeat={handleTribulationDefeat}
        />
      )}

      {activeBattleEnemy && (
        <BattleModal
          player={player}
          enemy={activeBattleEnemy}
          onVictory={handleBattleVictory}
          onDefeat={handleBattleDefeat}
          onFlee={handleBattleFlee}
        />
      )}

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}

      {/* Death & Reincarnation Modal */}
      {deathReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#141822] border-2 border-rose-600 rounded-xl p-6 md:p-8 max-w-md w-full text-center shadow-[0_0_60px_rgba(225,29,72,0.5)]">
            <span className="text-5xl block mb-3">💀</span>
            <h2 className="text-2xl font-bold text-rose-400 mb-2">身死道消 · 大道未成</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{deathReason}</p>
            <div className="bg-[#0e1117] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 mb-6">
              <div>最終享年：{player.age} 歲</div>
              <div>所達境界：{REALMS[player.realmIdx].name}</div>
              <div>一生滅敵：{player.killCount} 人/獸</div>
            </div>
            <button
              onClick={() => {
                sound.playBreakthrough();
                setDeathReason(null);
                setIsCreateOpen(true);
              }}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-lg border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
            >
              🔄 逆天改命 · 轉世重修
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
