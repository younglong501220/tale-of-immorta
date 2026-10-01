import React, { useState, useMemo } from 'react';
import {
  AllianceMember,
  AllianceScripture,
  DiplomaticLogCategory,
  DiplomaticLogEntry,
  DiplomaticRoleType,
  DomainTerritory,
  ImmortalAlliance,
  MeritShopItem,
  Player,
  RivalAlliance,
  TechNode,
} from '../types/game';
import {
  ALLIANCE_MERIT_SHOP_ITEMS,
  ALLIANCE_SCRIPTURES,
  ALLIANCE_TECH_NODES,
  FORTIFICATION_TIERS,
} from '../data/gameData';
import { sound } from '../utils/audio';
import {
  Globe2,
  Shield,
  Swords,
  Coins,
  Crown,
  Sparkles,
  Users,
  Building,
  Flag,
  Flame,
  Award,
  Scroll,
  ShieldAlert,
  ArrowUpCircle,
  Wrench,
  CheckCircle,
  X,
  UserCheck,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Send,
  HelpCircle,
  History,
  TrendingUp,
  MapPin,
  Tag,
  Feather,
  Zap,
  Lock,
  Check,
  ShoppingBag,
  PackageCheck,
} from 'lucide-react';

interface Props {
  player: Player;
  territories: DomainTerritory[];
  rivalAlliances: RivalAlliance[];
  diplomaticLogs: DiplomaticLogEntry[];
  onFoundAlliance: (name: string, motto: string, crest: string) => void;
  onJoinRivalAlliance: (rival: RivalAlliance) => void;
  onConquerTerritory: (territory: DomainTerritory) => void;
  onCollectTaxes: (territoryId?: string) => void;
  onUpgradeTech: (
    branch: 'spirit' | 'war' | 'treasury',
    costGold?: number,
    costContribution?: number,
    techName?: string,
    tierLevel?: number
  ) => void;
  onAppointEnvoy: (territoryId: string, memberId: string, roleType: DiplomaticRoleType) => void;
  onRecallEnvoy: (territoryId: string) => void;
  onUpgradeFortification: (territoryId: string) => void;
  onRepairShield: (territoryId: string) => void;
  onDonateTreasury?: (amount: number) => void;
  onIssueDiplomaticDecree?: (
    category: DiplomaticLogCategory,
    territoryId: string,
    targetAlliance: string,
    decreeTitle: string,
    decreeDesc: string,
    strategicImpact: string
  ) => void;
  onAlliancePatrol?: () => void;
  onUnlockScripture?: (scriptureId: string, costContrib: number) => void;
  onBuyMeritItem?: (shopItemId: string) => void;
}

const CRESTS = ['🐉', '🪷', '⚡', '🗡️', '🩸', '🦅', '☀️', '☯️'];

export const AllianceTab: React.FC<Props> = ({
  player,
  territories,
  rivalAlliances,
  diplomaticLogs,
  onFoundAlliance,
  onJoinRivalAlliance,
  onConquerTerritory,
  onCollectTaxes,
  onUpgradeTech,
  onAppointEnvoy,
  onRecallEnvoy,
  onUpgradeFortification,
  onRepairShield,
  onDonateTreasury,
  onIssueDiplomaticDecree,
  onAlliancePatrol,
  onUnlockScripture,
  onBuyMeritItem,
}) => {
  const [subTab, setSubTab] = useState<
    'territories' | 'tech_tree' | 'headquarters' | 'scriptures' | 'merit_shop' | 'members' | 'envoys' | 'fortifications' | 'diplomatic_log'
  >('territories');

  // Creation form state
  const [createName, setCreateName] = useState('鬼谷八荒仙盟');
  const [createMotto, setCreateMotto] = useState('集結萬界仙修，踏碎凌霄，問鼎八荒！');
  const [selectedCrest, setSelectedCrest] = useState('🐉');

  // Treasury funding state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [donateAmount, setDonateAmount] = useState<number>(2000);

  // Alliance Tech Tree state
  const [techBranchFilter, setTechBranchFilter] = useState<'all' | 'spirit' | 'war' | 'treasury'>('all');
  const [inspectingTechNode, setInspectingTechNode] = useState<TechNode | null>(null);

  // Alliance Scripture Library state
  const [scriptureCategoryFilter, setScriptureCategoryFilter] = useState<'all' | 'combat' | 'cultivation' | 'defense' | 'fortune'>('all');
  const [inspectingScripture, setInspectingScripture] = useState<AllianceScripture | null>(null);

  // Alliance Merit Shop state
  const [meritCategoryFilter, setMeritCategoryFilter] = useState<'all' | 'elixir' | 'special' | 'talisman' | 'cultivation'>('all');
  const [inspectingMeritItem, setInspectingMeritItem] = useState<MeritShopItem | null>(null);

  // Envoy Appointment Modal state
  const [appointingTerritory, setAppointingTerritory] = useState<DomainTerritory | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedRoleType, setSelectedRoleType] = useState<DiplomaticRoleType>('defense_envoy');

  // Diplomatic Log Filtering & Summit state
  const [categoryFilter, setCategoryFilter] = useState<'all' | DiplomaticLogCategory>('all');
  const [territoryFilter, setTerritoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSummitOpen, setIsSummitOpen] = useState<boolean>(false);

  // Summit decree form states
  const [decreeType, setDecreeType] = useState<'negotiation' | 'tax' | 'defense'>('negotiation');
  const [summitTargetTerritory, setSummitTargetTerritory] = useState<string>(territories[0]?.id || '');
  const [summitTargetRival, setSummitTargetRival] = useState<string>(rivalAlliances[0]?.name || '');
  const [customDecreeNote, setCustomDecreeNote] = useState<string>('');

  const alliance = player.alliance;

  const playerMember = alliance
    ? alliance.members.find((m) => m.isPlayer) || alliance.members[0]
    : null;
  const playerContribution = playerMember ? playerMember.contribution : 0;

  const totalScriptureLevels = useMemo(() => {
    if (!player.unlockedScriptures) return 0;
    return Object.values(player.unlockedScriptures).reduce((sum, lvl) => sum + lvl, 0);
  }, [player.unlockedScriptures]);

  // Territories owned by player's alliance
  const ownedTerritories = alliance
    ? territories.filter((t) => t.ownerAllianceName === alliance.name)
    : [];

  const totalUncollectedTax = ownedTerritories.reduce((sum, t) => sum + t.unclaimedTaxGold, 0);

  // If Player has not joined an alliance yet
  if (!alliance) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="relative rounded-xl overflow-hidden border border-amber-900/40 shadow-2xl h-48 flex flex-col justify-end p-6 bg-gradient-to-t from-[#0e1117] via-[#0e1117]/80 to-transparent">
          <img
            src="/src/assets/images/xianxia_sect_sanctuary_1790696995924.jpg"
            alt="跨服仙盟爭霸"
            className="absolute inset-0 w-full h-full object-cover object-center -z-10 brightness-50 contrast-125"
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-2">
              <Globe2 className="w-3.5 h-3.5" /> 跨服仙盟 · 萬界逐鹿
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-amber-200 tracking-wide">
              跨服仙盟爭霸 · 八荒領地稅收權
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              天地浩大，單打獨鬥終難成至尊。與跨服道友結成仙道同盟，委派長老談判聯防、加固護盾防禦工事，攻佔靈礦重鎮，徵收八荒歲稅！
            </p>
          </div>
        </div>

        {/* Founding or Joining Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Alliance */}
          <div className="bg-[#141822] border border-amber-600/60 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-amber-300">開宗立派 · 創立跨服仙盟</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                創立屬於你的跨界同盟，自任【盟主】，招募全服群雄，委派長老負責特定領地談判與聯防，統率百萬仙兵征戰八荒領地！
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">仙盟徽記圖騰：</label>
                  <div className="flex gap-2">
                    {CRESTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCrest(c)}
                        className={`text-xl p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedCrest === c
                            ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-md'
                            : 'bg-[#1b2230] border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">仙盟尊號名稱：</label>
                  <input
                    type="text"
                    value={createName}
                    maxLength={12}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="輸入仙盟名..."
                    className="w-full bg-[#0b0e14] border border-[#2d3443] focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-amber-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">仙盟檄文法旨 (盟旨)：</label>
                  <input
                    type="text"
                    value={createMotto}
                    maxLength={30}
                    onChange={(e) => setCreateMotto(e.target.value)}
                    placeholder="輸入仙盟檄文..."
                    className="w-full bg-[#0b0e14] border border-[#2d3443] focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>創盟修為要求：</span>
                    <span className="text-emerald-400 font-semibold">築基境及以上 (已滿足)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>創盟建宗資費：</span>
                    <span className="font-mono font-bold text-amber-400">1,000 靈石</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (player.gold < 1000) {
                  alert('靈石不足 1,000，無法奠定跨服仙盟根基！');
                  return;
                }
                sound.playWarDrum();
                onFoundAlliance(createName.trim() || '大荒仙盟', createMotto.trim(), selectedCrest);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" /> 宣誓立盟 · 晉任【跨服盟主】(-1000 靈石)
            </button>
          </div>

          {/* Join Rival Alliance */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe2 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-bold text-cyan-300">依附群雄 · 拜入既有跨服仙盟</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                各界仙盟盤踞一方，實力深厚。拜入大盟可立即享有同盟庇護、領地稅收分紅與聚靈大陣加成！
              </p>

              <div className="space-y-3 mb-4">
                {rivalAlliances.map((rival) => (
                  <div
                    key={rival.id}
                    className="p-3 bg-[#0d1016] rounded-lg border border-slate-800 hover:border-cyan-600/70 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-300">{rival.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {rival.server}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        盟主：<span className="text-slate-200">{rival.leader}</span> · 總戰力：
                        <span className="text-amber-400 font-mono font-semibold">
                          {rival.power.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playBreakthrough();
                        onJoinRivalAlliance(rival);
                      }}
                      className="py-1.5 px-3 bg-[#1b2230] hover:bg-cyan-800/80 text-cyan-200 border border-cyan-700/60 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                    >
                      投身此盟
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center">
              加入仙盟後可代表該盟參與每週「萬界領地爭奪戰」
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Open appoint dialog
  const handleOpenAppointModal = (t: DomainTerritory) => {
    setAppointingTerritory(t);
    // Default member
    if (alliance.members.length > 0) {
      setSelectedMemberId(alliance.members[0].id);
    }
  };

  const handleConfirmAppoint = () => {
    if (!appointingTerritory || !selectedMemberId) return;
    sound.playDing();
    onAppointEnvoy(appointingTerritory.id, selectedMemberId, selectedRoleType);
    setAppointingTerritory(null);
  };

  // --- Joined Alliance Dashboard ---
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Alliance Banner & Status Card */}
      <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 rounded-xl bg-[#0b0e14] border border-amber-600/50 shadow-inner">
              {alliance.crest}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-amber-300">{alliance.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 font-semibold">
                  等級 {alliance.level} 級仙盟
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                  {alliance.serverOrigin}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 italic">「{alliance.motto}」</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-3 bg-[#0d1016] p-3 rounded-lg border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">盟內職銜</span>
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> {alliance.role}
              </span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400 block text-[11px]">同盟成員</span>
              <span className="font-bold text-slate-200">{alliance.membersCount} 位仙修</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400 block text-[11px]">掌控重鎮</span>
              <span className="font-bold text-emerald-400">{ownedTerritories.length} 處領地</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400 block text-[11px]">仙盟金庫儲備</span>
              <span className="font-mono font-bold text-amber-400">
                {alliance.funds.toLocaleString()} 靈石
              </span>
            </div>
          </div>
        </div>

        {/* Global Tax Claim Alert if taxes are waiting */}
        {ownedTerritories.length > 0 && totalUncollectedTax > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-950/60 via-[#181f2b] to-[#141822] border border-amber-600/70 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">
                  八荒領地歲稅已累積：
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm ml-1">
                  +{totalUncollectedTax.toLocaleString()} 靈石
                </span>
                <span className="text-slate-400 ml-2">
                  (涵蓋 {ownedTerritories.length} 處重鎮之天材地寶產出)
                </span>
              </div>
            </div>

            <button
              onClick={() => onCollectTaxes()}
              className="py-1.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              💰 一鍵徵收八荒領地賦稅
            </button>
          </div>
        )}

        {/* Sub-tab switcher */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('territories');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'territories'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> ⚔️ 萬界領地爭奪戰 (5大重鎮)
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('tech_tree');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'tech_tree' || subTab === 'headquarters'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> ⚡ 仙盟天道科技樹
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-600 font-mono font-bold">
              Lv.{alliance.spiritArrayLevel + alliance.warArrayLevel + alliance.treasuryLevel}/15
            </span>
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('scriptures');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'scriptures'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" /> 📜 仙盟藏經閣
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-600 font-mono font-bold">
              {totalScriptureLevels > 0 ? `Lv.${totalScriptureLevels}/30` : '道藏被動'}
            </span>
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('merit_shop');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'merit_shop'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" /> 🏪 仙盟戰功商店
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-600 font-mono font-bold">
              築基丹/重置券
            </span>
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('members');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'members'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 👥 跨服同盟道友錄 ({alliance.members.length})
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('envoys');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'envoys'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" /> 👑 外交特使職位管理 ({territories.filter((t) => t.appointedEnvoy).length}/{territories.length})
            {territories.some((t) => t.ownerAllianceName === alliance.name && !t.appointedEnvoy) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('fortifications');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'fortifications'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> 🛡️ 領地防禦工事
          </button>
          <button
            onClick={() => {
              sound.playDing();
              setSubTab('diplomatic_log');
            }}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'diplomatic_log'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" /> 📜 仙盟政略誌 ({diplomaticLogs.length})
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: Territories (Domain Contention) --- */}
      {subTab === 'territories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" /> 八荒萬界爭奪重鎮分佈
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                盟主可委派長老負責特定領地外交談判或聯防，並消耗資金加固防禦工事護盾！
              </p>
            </div>
            <span className="text-xs text-amber-400/90 font-mono">
              所轄重鎮：{ownedTerritories.length} / {territories.length}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {territories.map((territory) => {
              const isOwner = territory.ownerAllianceName === alliance.name;
              const hasTaxesToCollect = isOwner && territory.unclaimedTaxGold > 0;
              const shieldPercent = Math.min(100, Math.max(0, (territory.shieldHp / territory.maxShieldHp) * 100));

              const currentTier = FORTIFICATION_TIERS.find((f) => f.level === territory.fortificationLevel) || FORTIFICATION_TIERS[0];
              const nextTier = FORTIFICATION_TIERS.find((f) => f.level === territory.fortificationLevel + 1);

              return (
                <div
                  key={territory.id}
                  className={`bg-[#141822] rounded-xl p-5 border flex flex-col justify-between transition-all shadow-lg ${
                    isOwner
                      ? 'border-amber-500/80 bg-gradient-to-b from-[#19202c] to-[#141822] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'border-[#273042] hover:border-slate-600'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1.5 rounded-lg bg-[#0b0e14] border border-slate-800">
                          {territory.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-amber-300 text-base leading-snug">
                            {territory.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            所屬地域：{territory.region} · 推薦境界：{territory.recommendedRealm}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                          isOwner
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {isOwner ? '✓ 本盟掌控中' : '⚔️ 敵盟占領中'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed my-2">
                      {territory.desc}
                    </p>

                    {/* Fortification & Shield Status */}
                    <div className="bg-[#0e1219] p-3 rounded-lg border border-slate-800/80 mb-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-cyan-400" />
                          領地防禦工事：
                          <span className="font-bold text-cyan-300">
                            {territory.fortificationName} (Lv.{territory.fortificationLevel})
                          </span>
                        </span>
                        <span className="font-mono text-xs text-cyan-400">
                          護盾: {territory.shieldHp} / {territory.maxShieldHp}
                        </span>
                      </div>

                      {/* Shield bar */}
                      <div className="h-2 w-full bg-[#080a0e] rounded-full overflow-hidden border border-cyan-950">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          style={{ width: `${shieldPercent}%` }}
                        />
                      </div>

                      {/* Envoy Status banner */}
                      {territory.appointedEnvoy ? (
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-300">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              <strong>{territory.appointedEnvoy.title}</strong>：
                              {territory.appointedEnvoy.memberName}
                              <span className="text-[11px] text-slate-400 ml-1">
                                ({territory.appointedEnvoy.bonusDesc})
                              </span>
                            </span>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => onRecallEnvoy(territory.id)}
                              className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer shrink-0 ml-2"
                            >
                              撤銷
                            </button>
                          )}
                        </div>
                      ) : isOwner ? (
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span>外交職位：暫無長老駐防議稅</span>
                          <button
                            onClick={() => handleOpenAppointModal(territory)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            + 委派長老外交/聯防
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Sovereignty & Tax Information */}
                    <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 space-y-1.5 mb-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">當前領地宗主：</span>
                        <span className={`font-semibold ${isOwner ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                          {territory.ownerAllianceName} ({territory.ownerServer})
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">每週賦稅產出：</span>
                        <span className="font-mono font-bold text-amber-400">
                          +{territory.weeklyTaxGold.toLocaleString()} 靈石 / 週
                          {territory.appointedEnvoy?.roleType === 'tax_commissioner' && (
                            <span className="text-emerald-400 font-bold ml-1">(+30% 特使加成)</span>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">伴生天材地寶：</span>
                        <span className="text-cyan-300 font-medium">
                          {territory.specialResource}
                        </span>
                      </div>

                      {!isOwner && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                          <span>守關大能：</span>
                          <span className="text-rose-300">
                            {territory.championName} (攻:{territory.championAtk} · 防:{territory.championDef})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    {isOwner ? (
                      <>
                        {/* Fortification & Envoy buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onUpgradeFortification(territory.id)}
                            disabled={!nextTier}
                            className="py-1.5 px-2 bg-[#192230] hover:bg-cyan-900/60 disabled:opacity-40 border border-cyan-700/60 text-cyan-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title={nextTier ? `消耗 ${nextTier.cost} 升級為 ${nextTier.name}` : '防禦工事已達最高境界'}
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400" />
                            {nextTier ? `升級工事 (Lv.${territory.fortificationLevel + 1})` : '工事已臻極致'}
                          </button>

                          <button
                            onClick={() => onRepairShield(territory.id)}
                            disabled={territory.shieldHp >= territory.maxShieldHp}
                            className="py-1.5 px-2 bg-[#192230] hover:bg-blue-900/60 disabled:opacity-40 border border-blue-700/60 text-blue-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5 text-blue-400" />
                            修復護盾
                          </button>
                        </div>

                        {/* Tax collect button */}
                        <button
                          onClick={() => {
                            sound.playCoin();
                            onCollectTaxes(territory.id);
                          }}
                          disabled={!hasTaxesToCollect}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            hasTaxesToCollect
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          {hasTaxesToCollect
                            ? `💰 徵收該重鎮歲稅 (+${territory.unclaimedTaxGold} 靈石)`
                            : '暫無待收賦稅'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playWarDrum();
                          onConquerTerritory(territory);
                        }}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 hover:from-rose-800 hover:to-red-700 text-amber-200 border border-rose-500 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                      >
                        <Swords className="w-4 h-4 text-amber-300" />
                        發動跨服遠征 · 攻打奪取【{territory.name}】！
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: Alliance Tech Tree (仙盟天道科技樹) --- */}
      {(subTab === 'tech_tree' || subTab === 'headquarters') && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#111624] via-[#171e2e] to-[#0e121a] border border-amber-500/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> 八荒天道 · 仙陣傳承
                </div>
                <h3 className="text-lg md:text-xl font-black text-amber-200 tracking-wide flex items-center gap-2">
                  <span>⚡ 仙盟天道科技樹 (Alliance Celestial Tech Tree)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  全盟同修齊聚一堂，消耗積累之【靈石】與【仙盟戰功】共參天道，點亮聚靈、誅仙、金庫三大祖陣，解鎖永久全盟修為倍率、攻防戰力與領地歲稅收益！
                </p>
              </div>

              {/* Resource Counter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                <div className="bg-[#0b0e14]/90 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">本尊儲備靈石</span>
                  <span className="font-mono font-bold text-xs text-amber-300">
                    💎 {player.gold.toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#0b0e14]/90 p-2.5 rounded-lg border border-amber-700/60 text-center shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                  <span className="text-[10px] text-amber-300/80 block">本尊仙盟戰功</span>
                  <span className="font-mono font-bold text-xs text-amber-400">
                    🎖️ {playerContribution.toLocaleString()} 點
                  </span>
                </div>
                <div className="bg-[#0b0e14]/90 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">仙盟金庫儲備</span>
                  <span className="font-mono font-bold text-xs text-cyan-300">
                    🏛️ {alliance.funds.toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#0b0e14]/90 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">科技研發總階</span>
                  <span className="font-mono font-bold text-xs text-emerald-400">
                    📜 {alliance.spiritArrayLevel + alliance.warArrayLevel + alliance.treasuryLevel} / 15
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contribution Earning Channel Banner */}
          <div className="bg-[#121722] border border-amber-600/30 rounded-xl p-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-300">
                  仙盟戰功快速籌備通道 · 齊修大陣
                </h4>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  (研究天道科技需同時耗費本尊靈石與戰功點數)
                </span>
              </div>
              <span className="text-[11px] text-amber-400/80 font-mono">
                當前可用戰功：{playerContribution} 點
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Channel 1: Border Patrol */}
              <div className="bg-[#0c0f16] border border-slate-800 hover:border-amber-600/50 rounded-lg p-3 flex flex-col justify-between transition-all">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Flag className="w-3.5 h-3.5 text-cyan-400" /> 🚩 八荒領地巡哨 (每日要務)
                    </span>
                    <span className="text-amber-400 font-mono">+150 戰功</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                    巡弋八荒邊界重鎮，掃蕩越境窺伺的魔道劫修，獲賜盟主戰功與靈石賞金。
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onAlliancePatrol) onAlliancePatrol();
                    else sound.playDing();
                  }}
                  className="w-full py-1.5 px-3 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800 hover:to-blue-800 border border-cyan-600/60 text-cyan-200 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Flag className="w-3 h-3" /> 奉旨八荒巡哨 (+150 戰功)
                </button>
              </div>

              {/* Channel 2: Treasury Donation */}
              <div className="bg-[#0c0f16] border border-slate-800 hover:border-amber-600/50 rounded-lg p-3 flex flex-col justify-between transition-all">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Coins className="w-3.5 h-3.5 text-amber-400" /> 💰 金庫注資撥款 (同修共建)
                    </span>
                    <span className="text-amber-400 font-mono">+25% 戰功</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                    長老將個人靈石撥入仙盟金庫儲備，每撥付 1,000 靈石立獲 +250 仙盟戰功。
                  </p>
                </div>
                <button
                  onClick={() => {
                    sound.playCoin();
                    setIsDonateModalOpen(true);
                  }}
                  className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-900/60 to-yellow-900/60 hover:from-amber-800 hover:to-yellow-800 border border-amber-600/60 text-amber-200 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Coins className="w-3 h-3" /> 向仙盟金庫注資撥款
                </button>
              </div>

              {/* Channel 3: Tax Collection */}
              <div className="bg-[#0c0f16] border border-slate-800 hover:border-amber-600/50 rounded-lg p-3 flex flex-col justify-between transition-all">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <Scroll className="w-3.5 h-3.5 text-emerald-400" /> 🌾 徵收重鎮歲稅 (領地治理)
                    </span>
                    <span className="text-emerald-400 font-mono">+50 戰功/座</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                    調取所轄重鎮累積靈石歲稅歸庫，每成功徵納一處重鎮榮立 +50 點戰功。
                  </p>
                </div>
                <button
                  onClick={() => onCollectTaxes()}
                  className="w-full py-1.5 px-3 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 hover:from-emerald-800 hover:to-teal-800 border border-emerald-600/60 text-emerald-200 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Scroll className="w-3 h-3" /> 一鍵徵收八荒歲稅
                </button>
              </div>
            </div>
          </div>

          {/* Active Permanent Buffs KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spirit Array KPI */}
            <div className="bg-[#141822] border border-cyan-800/60 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-lg bg-[#0b0e14] border border-cyan-800/80">🌸</span>
                    <div>
                      <h4 className="font-bold text-cyan-300 text-sm">聚靈通天陣脈</h4>
                      <span className="text-[10px] text-slate-400">修為悟道 · 氣海凝元</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600 font-mono">
                    Lv.{alliance.spiritArrayLevel} / 5
                  </span>
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">當前生效增益：</span>
                    <span className="font-bold text-cyan-300">
                      修為獲取倍率 +{alliance.spiritArrayLevel * 15}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">陣法作用域：</span>
                    <span className="text-slate-300">洞府閉關入定、大荒探秘</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>陣脈修煉進度</span>
                    <span className="font-mono text-cyan-400">{alliance.spiritArrayLevel * 20}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#080a0e] rounded-full overflow-hidden border border-cyan-950">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 rounded-full transition-all duration-300"
                      style={{ width: `${(alliance.spiritArrayLevel / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTechBranchFilter('spirit')}
                className="mt-3 w-full py-1 px-2.5 rounded text-[11px] font-bold bg-[#1b2230] hover:bg-cyan-950 text-cyan-300 border border-cyan-800/60 cursor-pointer transition-colors"
              >
                查看聚靈陣脈進階 →
              </button>
            </div>

            {/* War Array KPI */}
            <div className="bg-[#141822] border border-rose-800/60 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-lg bg-[#0b0e14] border border-rose-800/80">⚔️</span>
                    <div>
                      <h4 className="font-bold text-rose-300 text-sm">誅仙戮魔戰陣</h4>
                      <span className="text-[10px] text-slate-400">攻防殺伐 · 萬界伏誅</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-600 font-mono">
                    Lv.{alliance.warArrayLevel} / 5
                  </span>
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">當前生效增益：</span>
                    <span className="font-bold text-rose-300">
                      全盟 攻+{alliance.warArrayLevel * 60} · 防+{alliance.warArrayLevel * 30}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">戰力評價增幅：</span>
                    <span className="text-amber-400 font-mono font-bold">
                      +{(alliance.warArrayLevel * 1500).toLocaleString()} 點
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>戰陣修煉進度</span>
                    <span className="font-mono text-rose-400">{alliance.warArrayLevel * 20}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#080a0e] rounded-full overflow-hidden border border-rose-950">
                    <div
                      className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${(alliance.warArrayLevel / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTechBranchFilter('war')}
                className="mt-3 w-full py-1 px-2.5 rounded text-[11px] font-bold bg-[#1b2230] hover:bg-rose-950 text-rose-300 border border-rose-800/60 cursor-pointer transition-colors"
              >
                查看戰陣殺伐進階 →
              </button>
            </div>

            {/* Treasury Tech KPI */}
            <div className="bg-[#141822] border border-amber-800/60 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-lg bg-[#0b0e14] border border-amber-800/80">🪙</span>
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm">八荒乾坤金庫</h4>
                      <span className="text-[10px] text-slate-400">歲稅增幅 · 富甲天下</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600 font-mono">
                    Lv.{alliance.treasuryLevel} / 5
                  </span>
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">當前生效增益：</span>
                    <span className="font-bold text-amber-400">
                      領地歲稅總額 +{alliance.treasuryLevel * 20}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">經濟賦稅加權：</span>
                    <span className="text-slate-300">重鎮極品奇珍爆率翻倍</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>金庫修繕進度</span>
                    <span className="font-mono text-amber-400">{alliance.treasuryLevel * 20}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#080a0e] rounded-full overflow-hidden border border-amber-950">
                    <div
                      className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-300 rounded-full transition-all duration-300"
                      style={{ width: `${(alliance.treasuryLevel / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTechBranchFilter('treasury')}
                className="mt-3 w-full py-1 px-2.5 rounded text-[11px] font-bold bg-[#1b2230] hover:bg-amber-950 text-amber-300 border border-amber-800/60 cursor-pointer transition-colors"
              >
                查看乾坤金庫進階 →
              </button>
            </div>
          </div>

          {/* Branch Filter Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTechBranchFilter('all')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  techBranchFilter === 'all'
                    ? 'bg-amber-600 text-slate-950 shadow-sm'
                    : 'bg-[#141822] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                ✨ 全部天道陣脈 (共 15 陣階)
              </button>
              <button
                onClick={() => setTechBranchFilter('spirit')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  techBranchFilter === 'spirit'
                    ? 'bg-cyan-600 text-slate-950 shadow-sm'
                    : 'bg-[#141822] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                🌸 聚靈道系 (Lv.{alliance.spiritArrayLevel}/5 · 修為獲取)
              </button>
              <button
                onClick={() => setTechBranchFilter('war')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  techBranchFilter === 'war'
                    ? 'bg-rose-600 text-slate-950 shadow-sm'
                    : 'bg-[#141822] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                ⚔️ 戰陣殺伐 (Lv.{alliance.warArrayLevel}/5 · 攻防戰力)
              </button>
              <button
                onClick={() => setTechBranchFilter('treasury')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  techBranchFilter === 'treasury'
                    ? 'bg-amber-600 text-slate-950 shadow-sm'
                    : 'bg-[#141822] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                🪙 乾坤金庫 (Lv.{alliance.treasuryLevel}/5 · 賦稅效能)
              </button>
            </div>

            <span className="text-xs text-slate-400">
              提示：長老道友皆可消耗靈石與戰功參悟研發
            </span>
          </div>

          {/* Visual Tech Tree Flow / Matrix */}
          <div className="space-y-6">
            {(['spirit', 'war', 'treasury'] as const)
              .filter((branch) => techBranchFilter === 'all' || techBranchFilter === branch)
              .map((branch) => {
                const branchNodes = ALLIANCE_TECH_NODES.filter((n) => n.branch === branch);
                const currentLevel =
                  branch === 'spirit'
                    ? alliance.spiritArrayLevel
                    : branch === 'war'
                    ? alliance.warArrayLevel
                    : alliance.treasuryLevel;

                const branchMeta = {
                  spirit: {
                    title: '🌸 聚靈道系 · 天地凝元大陣 (Spirit Array)',
                    desc: '引九天罡風與地脈生機交匯，加速全盟同袍吐納與洞府修煉，永久提高修為獲取倍率！',
                    accentColor: 'border-cyan-700/60 bg-gradient-to-r from-cyan-950/40 via-[#141822] to-[#0d1017]',
                    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-600',
                  },
                  war: {
                    title: '⚔️ 戰陣殺伐 · 誅仙戮魔戰陣 (War Array)',
                    desc: '演化無上殺伐劍陣與金剛護法之盾，永久賦予全體成員攻擊、防禦加成與攻堅暴擊抗性！',
                    accentColor: 'border-rose-700/60 bg-gradient-to-r from-rose-950/40 via-[#141822] to-[#0d1017]',
                    badgeColor: 'bg-rose-950 text-rose-300 border-rose-600',
                  },
                  treasury: {
                    title: '🪙 金庫司管 · 八荒乾坤金庫 (Treasury Efficiency)',
                    desc: '設立萬界經緯稅司與跨界驛館，大幅提升各處占領重鎮每週歲稅徵收倍率與奇珍爆率！',
                    accentColor: 'border-amber-700/60 bg-gradient-to-r from-amber-950/40 via-[#141822] to-[#0d1017]',
                    badgeColor: 'bg-amber-950 text-amber-300 border-amber-600',
                  },
                }[branch];

                return (
                  <div
                    key={branch}
                    className={`rounded-2xl border p-5 space-y-4 shadow-xl ${branchMeta.accentColor}`}
                  >
                    {/* Branch Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                          <span>{branchMeta.title}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${branchMeta.badgeColor}`}>
                            當前陣階：第 {currentLevel} 階 (最高5階)
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          {branchMeta.desc}
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400">本陣脈參悟狀態：</span>
                        <span className="font-bold text-amber-300 ml-1">
                          {currentLevel >= 5 ? '已至無上大成境界' : `待參悟第 ${currentLevel + 1} 階`}
                        </span>
                      </div>
                    </div>

                    {/* Nodes Matrix - 5 Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                      {branchNodes.map((node) => {
                        const isResearched = currentLevel >= node.level;
                        const isResearchable = currentLevel === node.level - 1;
                        const isLocked = currentLevel < node.level - 1;

                        const hasEnoughGold = player.gold >= node.costGold;
                        const hasEnoughContrib = playerContribution >= node.costContribution;
                        const canAfford = hasEnoughGold && hasEnoughContrib;

                        return (
                          <div
                            key={node.id}
                            className={`rounded-xl p-3.5 flex flex-col justify-between transition-all relative ${
                              isResearched
                                ? 'bg-[#0f1822] border-2 border-emerald-600/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : isResearchable
                                ? 'bg-[#181d28] border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                                : 'bg-[#0b0e14]/90 border border-slate-800 opacity-60'
                            }`}
                          >
                            {/* Tier Badge & Status */}
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase ${
                                    node.level === 5
                                      ? 'bg-rose-950 text-rose-300 border border-rose-600'
                                      : node.level === 4
                                      ? 'bg-purple-950 text-purple-300 border border-purple-600'
                                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                                  }`}
                                >
                                  Tier {node.level} 階
                                </span>

                                {isResearched ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> 大成
                                  </span>
                                ) : isResearchable ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-500 animate-pulse flex items-center gap-0.5">
                                    <Zap className="w-3 h-3" /> 可研發
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                    <Lock className="w-3 h-3" /> 鎖定
                                  </span>
                                )}
                              </div>

                              {/* Node Icon & Name */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl p-1 rounded-lg bg-[#080b10] border border-slate-800 shrink-0">
                                  {node.icon}
                                </span>
                                <div>
                                  <h5
                                    className={`font-bold text-xs leading-snug ${
                                      isResearched
                                        ? 'text-emerald-300'
                                        : isResearchable
                                        ? 'text-amber-200'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {node.name}
                                  </h5>
                                  <span className="text-[10px] text-slate-400">
                                    {node.branch === 'spirit'
                                      ? '修為悟道陣脈'
                                      : node.branch === 'war'
                                      ? '殺伐戰意陣脈'
                                      : '富國強兵金庫'}
                                  </span>
                                </div>
                              </div>

                              {/* Lore desc */}
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2.5">
                                {node.desc}
                              </p>

                              {/* Benefit Highlight Box */}
                              <div
                                className={`p-2 rounded-lg border text-xs mb-3 ${
                                  isResearched
                                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                                    : isResearchable
                                    ? 'bg-amber-950/40 border-amber-700/80 text-amber-200'
                                    : 'bg-[#080a0e] border-slate-800 text-slate-400'
                                }`}
                              >
                                <span className="block font-bold text-[11px] mb-0.5 flex items-center gap-1">
                                  ★ {node.benefitTitle}
                                </span>
                                <span className="block text-[10px] opacity-80 leading-normal">
                                  {node.benefitDesc}
                                </span>
                              </div>
                            </div>

                            {/* Cost Box & Action Button */}
                            <div className="space-y-2 pt-2 border-t border-slate-800/80">
                              {!isResearched && (
                                <div className="space-y-1 text-[11px]">
                                  {/* Gold Cost */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">💎 靈石需求：</span>
                                    <span
                                      className={`font-mono font-bold ${
                                        hasEnoughGold ? 'text-amber-400' : 'text-rose-400'
                                      }`}
                                    >
                                      {node.costGold.toLocaleString()}
                                    </span>
                                  </div>
                                  {/* Contribution Cost */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">🎖️ 戰功需求：</span>
                                    <span
                                      className={`font-mono font-bold ${
                                        hasEnoughContrib ? 'text-cyan-400' : 'text-rose-400'
                                      }`}
                                    >
                                      {node.costContribution} 點
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              {isResearched ? (
                                <button
                                  disabled
                                  className="w-full py-1.5 px-2 bg-emerald-950/60 border border-emerald-700 text-emerald-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> 陣法圓滿運轉中
                                </button>
                              ) : isResearchable ? (
                                <button
                                  onClick={() => {
                                    if (!canAfford) {
                                      alert(
                                        `參悟所需修行資產不足！\n靈石：${player.gold}/${node.costGold.toLocaleString()}\n仙盟戰功：${playerContribution}/${node.costContribution}\n\n可透過「八荒巡哨」或「向金庫注資」快速積累戰功！`
                                      );
                                      return;
                                    }
                                    onUpgradeTech(
                                      node.branch,
                                      node.costGold,
                                      node.costContribution,
                                      node.name,
                                      node.level
                                    );
                                  }}
                                  className={`w-full py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md ${
                                    canAfford
                                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                                      : 'bg-[#181d28] border-rose-700/60 text-rose-300 hover:bg-rose-950/40'
                                  }`}
                                >
                                  {canAfford ? (
                                    <>
                                      <Zap className="w-3.5 h-3.5 fill-current" /> 參悟研發此階陣脈
                                    </>
                                  ) : (
                                    <>
                                      <span>資產不足 ({!hasEnoughGold ? '缺靈石 ' : ''}{!hasEnoughContrib ? '缺戰功' : ''})</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 text-slate-500 text-xs rounded-lg flex items-center justify-center gap-1 cursor-not-allowed"
                                >
                                  <Lock className="w-3.5 h-3.5" /> 需前置陣脈 (第 {node.level - 1} 階)
                                </button>
                              )}

                              <button
                                onClick={() => setInspectingTechNode(node)}
                                className="w-full text-center text-[10px] text-slate-400 hover:text-amber-300 transition-colors py-0.5 cursor-pointer underline"
                              >
                                查看法陣道韻詳解
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* --- SUBTAB: Alliance Scripture Library (仙盟藏經閣) --- */}
      {subTab === 'scriptures' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden border border-purple-800/50 shadow-2xl p-6 bg-gradient-to-r from-purple-950/70 via-[#151924] to-[#0e1117]">
            <img
              src="/src/assets/images/xianxia_sect_sanctuary_1790696995924.jpg"
              alt="仙盟藏經閣"
              className="absolute inset-0 w-full h-full object-cover object-center -z-10 brightness-40 contrast-125"
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-950/80 border border-purple-500/70 text-purple-300 mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> 萬界道藏 · 仙盟神通庫
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-amber-200 tracking-wide flex items-center gap-2">
                  📜 仙盟藏經閣 (Alliance Scripture Library)
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  同盟先賢遺存無上道藏。全體成員可消耗個人積累之「仙盟戰功/貢獻點」參悟道法，終身啟動各項強大被動神通（暴擊機率、洞府閉關修為、暴傷倍率、混元減傷、逆天增壽），庇佑仙道長青！
                </p>
              </div>

              {/* Player Contribution & Mastery Counter */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <div className="bg-[#121622]/90 border border-amber-500/60 rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/70 flex items-center justify-center text-xl shrink-0">
                    🎖️
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">個人可用仙盟戰功</span>
                    <span className="text-lg font-mono font-extrabold text-amber-400 tracking-tight">
                      {playerContribution.toLocaleString()} <span className="text-xs font-normal text-slate-300">點</span>
                    </span>
                  </div>
                </div>

                <div className="bg-[#121622]/90 border border-purple-500/60 rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/70 flex items-center justify-center text-xl shrink-0">
                    ✨
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">道藏修煉總重數</span>
                    <span className="text-lg font-mono font-extrabold text-purple-300 tracking-tight">
                      Lv.{totalScriptureLevels} <span className="text-xs font-normal text-slate-400">/ 30 重</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Passives Dashboard */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">已激活全域被動神通總覽 (Active Passive Buffs)</h3>
              </div>
              <span className="text-xs text-slate-400">所有參悟道藏終身生效，鬥法歷練時自動觸發</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ALLIANCE_SCRIPTURES.map((s) => {
                const lvl = player.unlockedScriptures?.[s.id] || 0;
                const bonusVal = lvl * s.valuePerLevel;
                const isActive = lvl > 0;

                return (
                  <div
                    key={s.id}
                    className={`rounded-lg p-3 border transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-purple-950/30 to-[#10141e] border-purple-500/50 shadow-md'
                        : 'bg-[#10141e] border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-base">{s.icon}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isActive
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isActive ? `第 ${lvl} 重` : '未領悟'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-300 truncate" title={s.name}>
                      {s.name.replace(/[《》]/g, '')}
                    </div>
                    <div className="mt-1 font-mono font-extrabold text-sm text-emerald-400">
                      {isActive ? `+${bonusVal}${s.unit}` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {s.effectType === 'crit_chance'
                        ? '鬥法暴擊幾率'
                        : s.effectType === 'meditation_exp'
                        ? '洞府閉關修為'
                        : s.effectType === 'crit_damage'
                        ? '暴擊致命傷害'
                        : s.effectType === 'damage_reduction'
                        ? '生死鬥法減傷'
                        : s.effectType === 'bonus_lifespan'
                        ? '修士壽元上限'
                        : '歷練尋寶靈石'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Contribution replenishment bar */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/50 via-[#181f2b] to-[#121622] border border-amber-600/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">仙盟戰功積累指引：</span>
                <span className="text-slate-300 ml-1">
                  參悟高階道藏需大量戰功，可透過領地巡查、金庫注資或八荒徵稅快速獲得！
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {onAlliancePatrol && (
                <button
                  onClick={onAlliancePatrol}
                  className="py-1 px-3 bg-[#1e2636] hover:bg-amber-900/60 text-amber-300 font-bold text-xs rounded-lg border border-amber-600/70 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" /> 領地巡守 (+150 戰功)
                </button>
              )}
              {onDonateTreasury && (
                <button
                  onClick={() => setIsDonateModalOpen(true)}
                  className="py-1 px-3 bg-[#1e2636] hover:bg-amber-900/60 text-amber-300 font-bold text-xs rounded-lg border border-amber-600/70 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> 金庫注資 (+25% 戰功)
                </button>
              )}
              <button
                onClick={() => onCollectTaxes()}
                className="py-1 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5" /> 徵收歲稅 (+50 戰功/座)
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '全部典籍 (6)' },
                { key: 'combat', label: '⚔️ 殺伐破煞 (暴擊/暴傷)' },
                { key: 'cultivation', label: '🧘 吐納修為 (閉關修為)' },
                { key: 'defense', label: '🛡️ 金剛禦體 (傷害減免)' },
                { key: 'fortune', label: '🌟 氣運造化 (壽元/靈石)' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    sound.playDing();
                    setScriptureCategoryFilter(tab.key as any);
                  }}
                  className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scriptureCategoryFilter === tab.key
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-[#1b2230] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              共計 6 部仙盟傳承道藏 · 每部上限 5 重天
            </span>
          </div>

          {/* Scriptures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALLIANCE_SCRIPTURES.filter((s) => {
              if (scriptureCategoryFilter === 'all') return true;
              return s.category === scriptureCategoryFilter;
            }).map((scripture) => {
              const currentLevel = player.unlockedScriptures?.[scripture.id] || 0;
              const isMax = currentLevel >= scripture.maxLevel;
              const nextLevel = currentLevel + 1;
              const nextCost = scripture.baseCost + currentLevel * scripture.costPerLevel;
              const canAfford = playerContribution >= nextCost;
              const currentBonus = currentLevel * scripture.valuePerLevel;
              const nextBonus = nextLevel * scripture.valuePerLevel;

              const rarityBorder =
                scripture.rarity === 'mythic'
                  ? 'border-purple-600/70 hover:border-purple-400'
                  : scripture.rarity === 'legendary'
                  ? 'border-amber-600/70 hover:border-amber-400'
                  : 'border-cyan-600/70 hover:border-cyan-400';

              const rarityBadge =
                scripture.rarity === 'mythic'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-600/70'
                  : scripture.rarity === 'legendary'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/70'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-600/70';

              return (
                <div
                  key={scripture.id}
                  className={`bg-[#141822] border ${rarityBorder} rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group`}
                >
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl -z-10 group-hover:bg-purple-600/10 transition-all" />

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#0e1117] border border-slate-800 flex items-center justify-center text-xl shrink-0">
                          {scripture.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-200 leading-snug">
                            {scripture.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${rarityBadge}`}>
                              {scripture.rarity === 'mythic'
                                ? '神品道藏'
                                : scripture.rarity === 'legendary'
                                ? '仙階絕典'
                                : '玄門古卷'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {scripture.category === 'combat'
                                ? '殺伐'
                                : scripture.category === 'cultivation'
                                ? '吐納'
                                : scripture.category === 'defense'
                                ? '禦體'
                                : '氣運'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tier badge */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono font-bold whitespace-nowrap ${
                          isMax
                            ? 'bg-amber-950 text-amber-300 border border-amber-600'
                            : currentLevel > 0
                            ? 'bg-purple-950 text-purple-300 border border-purple-600'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {isMax ? '已至大圓滿' : currentLevel > 0 ? `第 ${currentLevel} 重` : '尚未入門'}
                      </span>
                    </div>

                    {/* Progress Bar (5 tiers) */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>修煉進境</span>
                        <span className="font-mono text-purple-300">
                          {currentLevel} / {scripture.maxLevel} 重天
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: scripture.maxLevel }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${
                              idx < currentLevel
                                ? 'bg-gradient-to-r from-purple-500 to-amber-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Flavour quote */}
                    <p className="text-[11px] text-slate-400 italic mb-3 bg-[#0d1017] p-2 rounded border border-slate-800/80 leading-relaxed">
                      "{scripture.quote}"
                    </p>

                    {/* Effect Details Box */}
                    <div className="bg-[#0e1117] p-3 rounded-lg border border-slate-800/90 text-xs space-y-2 mb-4">
                      {/* Current Buff */}
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">當前神通生效加成：</span>
                        {currentLevel > 0 ? (
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            {scripture.effectType === 'crit_chance'
                              ? `鬥法暴擊幾率 +${currentBonus}%`
                              : scripture.effectType === 'meditation_exp'
                              ? `洞府閉關修為獲取 +${currentBonus}%`
                              : scripture.effectType === 'crit_damage'
                              ? `暴擊致命傷害倍率 +${currentBonus}%`
                              : scripture.effectType === 'damage_reduction'
                              ? `生死鬥法傷害減免 +${currentBonus}%`
                              : scripture.effectType === 'bonus_lifespan'
                              ? `修士陽壽上限延長 +${currentBonus} 年`
                              : `歷練尋寶靈石獲取 +${currentBonus}%`}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">尚未入門參悟 · 暫無加成</span>
                        )}
                      </div>

                      {/* Next Tier Buff Preview */}
                      {!isMax && (
                        <div className="border-t border-slate-800/80 pt-1.5">
                          <span className="text-[10px] text-amber-400 block mb-0.5">
                            參悟第 {nextLevel} 重天效果：
                          </span>
                          <span className="text-amber-200 font-semibold text-[11px]">
                            {scripture.effectType === 'crit_chance'
                              ? `暴擊幾率提升至 +${nextBonus}% (+${scripture.valuePerLevel}%)`
                              : scripture.effectType === 'meditation_exp'
                              ? `閉關修為提升至 +${nextBonus}% (+${scripture.valuePerLevel}%)`
                              : scripture.effectType === 'crit_damage'
                              ? `暴擊傷害提升至 +${nextBonus}% (+${scripture.valuePerLevel}%)`
                              : scripture.effectType === 'damage_reduction'
                              ? `傷害減免提升至 +${nextBonus}% (+${scripture.valuePerLevel}%)`
                              : scripture.effectType === 'bonus_lifespan'
                              ? `陽壽上限延長至 +${nextBonus} 年 (+${scripture.valuePerLevel}年)`
                              : `靈石繳獲提升至 +${nextBonus}% (+${scripture.valuePerLevel}%)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Cost */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {!isMax ? (
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-slate-400">所需戰功：</span>
                        <div className="flex items-center gap-1 font-mono font-bold">
                          <span className={canAfford ? 'text-amber-400' : 'text-rose-400'}>
                            {nextCost.toLocaleString()}
                          </span>
                          <span className="text-slate-500">/ {playerContribution.toLocaleString()} 點</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-amber-400 font-bold py-1">
                        ✨ 已臻化境 · 萬法圓滿
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setInspectingScripture(scripture)}
                        className="py-2 px-2.5 bg-[#1b2230] hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500 text-slate-300 text-xs rounded-lg transition-all cursor-pointer shrink-0"
                        title="查看道藏源流與各重天增益詳解"
                      >
                        📖 詳解
                      </button>

                      {isMax ? (
                        <button
                          disabled
                          className="flex-1 py-2 px-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-default"
                        >
                          <Check className="w-4 h-4" /> 功法已大成
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!canAfford) {
                              alert(`仙盟戰功不足 (${playerContribution}/${nextCost})！可透過八荒領地巡守、金庫注資或領地徵稅快速積累戰功！`);
                              return;
                            }
                            if (onUnlockScripture) {
                              onUnlockScripture(scripture.id, nextCost);
                            }
                          }}
                          disabled={!canAfford}
                          className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md ${
                            canAfford
                              ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                              : 'bg-[#181d28] border-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          {currentLevel === 0 ? `參悟入門 (${nextCost} 戰功)` : `參研進階 (第 ${nextLevel} 重)`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUBTAB: Alliance Merit Shop (仙盟戰功商店) --- */}
      {subTab === 'merit_shop' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden border border-amber-600/60 shadow-2xl p-6 bg-gradient-to-r from-amber-950/70 via-[#1a1528] to-[#0e1117]">
            <img
              src="/src/assets/images/xianxia_sect_sanctuary_1790696995924.jpg"
              alt="仙盟戰功商店"
              className="absolute inset-0 w-full h-full object-cover object-center -z-10 brightness-40 contrast-125"
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-500/70 text-amber-300 mb-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> 萬界秘庫 · 仙盟戰功專屬兌換
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-amber-200 tracking-wide flex items-center gap-2">
                  🏪 仙盟戰功商店 (Alliance Merit Shop)
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  同盟秘庫匯聚八荒天材地寶，論功行賞，犒勞全盟豪傑！修士可消耗積累之「仙盟戰功」限量兌換【天道築基丹】、【領悟點數重置券】、九轉金丹露與太乙長生果等稀有修煉資源，大幅拔高修仙破境底蘊！
                </p>
              </div>

              {/* Player Contribution Counter */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <div className="bg-[#121622]/90 border border-amber-500/70 rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/70 flex items-center justify-center text-xl shrink-0">
                    🎖️
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">個人可用仙盟戰功</span>
                    <span className="text-lg font-mono font-extrabold text-amber-400 tracking-tight">
                      {playerContribution.toLocaleString()} <span className="text-xs font-normal text-slate-300">點</span>
                    </span>
                  </div>
                </div>

                <div className="bg-[#121622]/90 border border-cyan-500/60 rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/70 flex items-center justify-center text-xl shrink-0">
                    🎒
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">儲物仙戒庫存容納</span>
                    <span className="text-lg font-mono font-extrabold text-cyan-300 tracking-tight">
                      {player.inventory.length} <span className="text-xs font-normal text-slate-400">/ 50 格</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contribution replenishment bar */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/50 via-[#181f2b] to-[#121622] border border-amber-600/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">戰功補充途徑：</span>
                <span className="text-slate-300 ml-1">
                  戰功可透過八荒領地巡守、金庫注資或領地徵稅快速賺取，隨時兌換心儀至寶！
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {onAlliancePatrol && (
                <button
                  onClick={onAlliancePatrol}
                  className="py-1 px-3 bg-[#1e2636] hover:bg-amber-900/60 text-amber-300 font-bold text-xs rounded-lg border border-amber-600/70 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" /> 領地巡守 (+150 戰功)
                </button>
              )}
              {onDonateTreasury && (
                <button
                  onClick={() => setIsDonateModalOpen(true)}
                  className="py-1 px-3 bg-[#1e2636] hover:bg-amber-900/60 text-amber-300 font-bold text-xs rounded-lg border border-amber-600/70 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> 金庫注資 (+25% 戰功)
                </button>
              )}
              <button
                onClick={() => onCollectTaxes()}
                className="py-1 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5" /> 徵收歲稅 (+50 戰功/座)
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '全部至寶 (6)' },
                { key: 'elixir', label: '🔮 靈丹妙藥 (築基丹/金丹露)' },
                { key: 'special', label: '📜 天道秘券 (重置券/因果符)' },
                { key: 'talisman', label: '🛡️ 辟邪破劫 (保命符)' },
                { key: 'cultivation', label: '🚩 神工工令 (領地修葺)' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    sound.playDing();
                    setMeritCategoryFilter(tab.key as any);
                  }}
                  className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    meritCategoryFilter === tab.key
                      ? 'bg-amber-600 text-slate-950 shadow-sm'
                      : 'bg-[#1b2230] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              每週秘庫限量供應 · 兌換後自動存入儲物仙戒
            </span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALLIANCE_MERIT_SHOP_ITEMS.filter((item) => {
              if (meritCategoryFilter === 'all') return true;
              return item.category === meritCategoryFilter;
            }).map((item) => {
              const boughtCount = player.meritShopPurchases?.[item.id] || 0;
              const remainingStock = Math.max(0, item.stockLimit - boughtCount);
              const isOutOfStock = remainingStock <= 0;
              const canAfford = playerContribution >= item.costContribution && !isOutOfStock;

              const isHighlight =
                item.id === 'merit_tiandao_zhuji_dan' || item.id === 'merit_destiny_reset_scroll';

              const rarityBorder =
                item.rarity === 'mythic'
                  ? 'border-purple-600/70 hover:border-purple-400'
                  : item.rarity === 'legendary'
                  ? 'border-amber-600/70 hover:border-amber-400'
                  : 'border-cyan-600/70 hover:border-cyan-400';

              const rarityBadge =
                item.rarity === 'mythic'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-600/70'
                  : item.rarity === 'legendary'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/70'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-600/70';

              return (
                <div
                  key={item.id}
                  className={`bg-[#141822] border ${
                    isHighlight ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : rarityBorder
                  } rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group`}
                >
                  {isHighlight && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-rose-600 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-bl-lg shadow-md">
                      🔥 鎮庫至寶
                    </div>
                  )}

                  <div>
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#0e1117] border border-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-200 leading-snug">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${rarityBadge}`}>
                              {item.rarity === 'mythic' ? '神品聖物' : item.rarity === 'legendary' ? '極品靈寶' : '稀世靈珍'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.category === 'elixir'
                                ? '靈丹'
                                : item.category === 'special'
                                ? '天道秘物'
                                : item.category === 'talisman'
                                ? '保命符'
                                : '陣法工令'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock status */}
                    <div className="flex items-center justify-between text-xs mb-3 bg-[#0e1117] p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400">每週限額兌換：</span>
                      <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isOutOfStock ? '已售罄 (0 庫存)' : `剩餘 ${remainingStock} / ${item.stockLimit} 次`}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {item.desc}
                    </p>

                    {/* Effect Highlight Box */}
                    <div className="bg-[#0b0e14] p-3 rounded-lg border border-amber-900/40 text-xs space-y-1 mb-4">
                      <span className="text-[10px] text-amber-400 font-bold block flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> 【修仙道果妙用】：
                      </span>
                      <p className="text-amber-200/90 text-[11px] leading-relaxed">
                        {item.effectDesc}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-slate-400">兌換所需戰功：</span>
                      <div className="flex items-center gap-1 font-mono font-bold">
                        <span className={playerContribution >= item.costContribution ? 'text-amber-400 text-sm' : 'text-rose-400 text-sm'}>
                          {item.costContribution.toLocaleString()}
                        </span>
                        <span className="text-slate-500">/ {playerContribution.toLocaleString()} 點</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setInspectingMeritItem(item)}
                        className="py-2 px-2.5 bg-[#1b2230] hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-all cursor-pointer shrink-0 border border-slate-700"
                        title="查看寶物道韻詳情"
                      >
                        📖 詳解
                      </button>

                      {isOutOfStock ? (
                        <button
                          disabled
                          className="flex-1 py-2 px-3 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed"
                        >
                          庫存已售罄
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!canAfford) {
                              alert(`仙盟戰功不足 (${playerContribution}/${item.costContribution})！可透過領地巡守或金庫注資獲取戰功！`);
                              return;
                            }
                            if (onBuyMeritItem) {
                              onBuyMeritItem(item.id);
                            }
                          }}
                          disabled={!canAfford}
                          className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-slate-950 font-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'bg-[#181d28] border-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5 text-slate-950" />
                          兌換入戒 ({item.costContribution} 戰功)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: Members Roster --- */}
      {subTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> 跨界仙修盟友名冊
            </h3>
            <span className="text-xs text-slate-400">匯聚各服飛昇者共襄盛舉</span>
          </div>

          <div className="bg-[#141822] border border-[#273042] rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1117] border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4">道號</th>
                    <th className="py-3 px-4">所屬界域</th>
                    <th className="py-3 px-4">修為境界</th>
                    <th className="py-3 px-4">同盟職務</th>
                    <th className="py-3 px-4">外交鎮守派遣</th>
                    <th className="py-3 px-4 text-right">戰力評估</th>
                    <th className="py-3 px-4 text-right">仙盟戰功</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {alliance.members.map((member) => {
                    const assignedTerritory = territories.find(
                      (t) => t.appointedEnvoy?.memberId === member.id
                    );

                    return (
                      <tr
                        key={member.id}
                        className={member.isPlayer ? 'bg-amber-950/20 font-bold' : 'hover:bg-[#181d28]'}
                      >
                        <td className="py-3 px-4 flex items-center gap-1.5">
                          <span className={member.isPlayer ? 'text-amber-300' : 'text-slate-200'}>
                            {member.name}
                          </span>
                          {member.isPlayer && (
                            <span className="text-[10px] px-1 rounded bg-amber-500 text-slate-950 font-black">
                              本尊
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{member.server}</td>
                        <td className="py-3 px-4 text-cyan-300">{member.realmName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              member.role === '盟主'
                                ? 'bg-amber-950 text-amber-300 border border-amber-700 font-bold'
                                : member.role === '護法長老'
                                ? 'bg-purple-950 text-purple-300 border border-purple-700'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {assignedTerritory ? (
                            <span className="text-amber-300 font-medium flex items-center gap-1">
                              <Scroll className="w-3.5 h-3.5 text-amber-400" />
                              {assignedTerritory.name.split('·')[1] || assignedTerritory.name}
                              <span className="text-[10px] text-slate-400">
                                ({assignedTerritory.appointedEnvoy?.title})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">待命中</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-400">
                          {member.combatPower.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {member.contribution} 點
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB: Foreign Envoy Position Management (外交特使職位管理) --- */}
      {subTab === 'envoys' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#141822] border border-amber-600/70 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-2">
                  <Crown className="w-3.5 h-3.5" /> 仙盟高層權限 · 萬界分封使節
                </div>
                <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                  外交特使職位管理 · 領地談判與聯防分封
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  仙盟盟主專屬政令：委派護法長老、副盟主或先鋒大能坐鎮五大重鎮，因地制宜出任「領地聯防長老」、「萬界談判使節」或「議稅巡查特使」，在 UI 中直觀展示各職位帶來的強大戰略加成數據（如領地護盾防禦加成、談判戰略貢獻與賦稅增收）。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    sound.playDing();
                    setSubTab('territories');
                  }}
                  className="py-1.5 px-3 bg-[#1b2230] hover:bg-[#253043] text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-400" /> 前往爭奪戰
                </button>
                <button
                  onClick={() => {
                    sound.playDing();
                    setSubTab('diplomatic_log');
                  }}
                  className="py-1.5 px-3 bg-[#1b2230] hover:bg-[#253043] text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Scroll className="w-3.5 h-3.5 text-amber-400" /> 查看政略誌
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-950/70 border border-amber-600/40 text-amber-300">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">特使在任編制</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {territories.filter((t) => t.appointedEnvoy).length} / {territories.length} 席
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-cyan-950/70 border border-cyan-600/40 text-cyan-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">總護盾防禦加成</span>
                  <span className="font-bold text-cyan-300 font-mono text-sm">
                    +{territories
                      .filter((t) => t.appointedEnvoy?.roleType === 'defense_envoy')
                      .reduce((sum, t) => sum + Math.floor(t.maxShieldHp * (1 / 3)), 0)
                      .toLocaleString()} HP
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-purple-950/70 border border-purple-600/40 text-purple-300">
                  <Scroll className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">每週談判貢獻</span>
                  <span className="font-bold text-purple-300 font-mono text-sm">
                    +{territories.filter((t) => t.appointedEnvoy?.roleType === 'negotiator').length * 40} 點 / 週
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-950/70 border border-emerald-600/40 text-emerald-300">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">每週額外賦稅</span>
                  <span className="font-bold text-emerald-300 font-mono text-sm">
                    +{territories
                      .filter((t) => t.appointedEnvoy?.roleType === 'tax_commissioner')
                      .reduce((sum, t) => sum + Math.floor(t.weeklyTaxGold * 0.3), 0)
                      .toLocaleString()} 靈石
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Great Diplomatic Roles Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Defense Envoy */}
            <div className="bg-[#141822] border border-cyan-800/60 rounded-xl p-4 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" /> 🛡️ 領地聯防長老
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-200">
                    青藍陣法 · 固若金湯
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  委派長老進駐重鎮陣眼，勾連地脈坤元真氣強化守護禁制，大幅抵禦外部敵盟進攻與攻城掠奪。
                </p>

                <div className="space-y-1.5 bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">護盾防禦上限：</span>
                    <span className="font-bold text-cyan-300 font-mono">+50% HP 增幅</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">攻城衝擊免傷：</span>
                    <span className="font-bold text-cyan-300 font-mono">+35% 傷害減免</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">地脈大陣修復：</span>
                    <span className="font-bold text-cyan-300 font-mono">維護成本 -50%</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-cyan-400/80 italic text-center">
                * 最適合分封於敵盟環伺之重鎮（如雷澤九天雷池、天帝神城）
              </div>
            </div>

            {/* 2. Tax Commissioner */}
            <div className="bg-[#141822] border border-amber-800/60 rounded-xl p-4 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" /> 💰 議稅巡查特使
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-200">
                    赤金稅契 · 府庫豐盈
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  委派精於算計之長老巡察礦脈與商行，整頓稅課，嚴打私採盜採，使仙盟歲稅儲備急速暴漲。
                </p>

                <div className="space-y-1.5 bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">每週靈石賦稅：</span>
                    <span className="font-bold text-amber-300 font-mono">+30% 直接增產</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">突破至寶產出：</span>
                    <span className="font-bold text-amber-300 font-mono">+50% 雙倍機率</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">礦石採掘漏損：</span>
                    <span className="font-bold text-amber-300 font-mono">100% 杜絕流失</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-amber-400/80 italic text-center">
                * 最適合分封於靈脈藥產豐碩之重鎮（如永寧青靈礦脈、華封長生谷）
              </div>
            </div>

            {/* 3. Negotiation Envoy */}
            <div className="bg-[#141822] border border-purple-800/60 rounded-xl p-4 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-purple-400" /> 📜 萬界談判使節
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700/60 text-purple-200">
                    玄紫盟約 · 捭闔萬界
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  委派德高望重之大能與周邊勢力展開縱橫捭闔，簽訂邊界停戰默契，威懾宵小魔道修士。
                </p>

                <div className="space-y-1.5 bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">每週談判貢獻：</span>
                    <span className="font-bold text-purple-300 font-mono">+40 點 / 週</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">敵盟暗算偷襲：</span>
                    <span className="font-bold text-purple-300 font-mono">-65% 掠奪機率</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">跨界通商朝貢：</span>
                    <span className="font-bold text-purple-300 font-mono">+800 靈石 / 週</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-purple-400/80 italic text-center">
                * 最適合分封於跨界混戰前線（如雲陌冥晶天脈、跨界接壤地）
              </div>
            </div>
          </div>

          {/* Territories Foreign Envoy Stationing Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" /> 八荒五大重鎮特使派遣與即時數據
              </h4>
              <span className="text-xs text-slate-400">
                點擊各重鎮卡片即可進行「委派職位」、「調任改派」或「召回總舵」
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {territories.map((territory) => {
                const isOwner = territory.ownerAllianceName === alliance.name;
                const envoy = territory.appointedEnvoy;
                const assignedMember = envoy
                  ? alliance.members.find((m) => m.id === envoy.memberId)
                  : null;

                // Real calculated bonuses for this specific territory
                const bonusDefenseShield = Math.floor(territory.maxShieldHp * (1 / 3));
                const bonusTaxGold = Math.floor(territory.weeklyTaxGold * 0.3);

                return (
                  <div
                    key={territory.id}
                    className={`bg-[#141822] border rounded-xl p-4 shadow-md transition-all ${
                      envoy
                        ? envoy.roleType === 'defense_envoy'
                          ? 'border-cyan-700/70 bg-gradient-to-br from-[#141822] via-[#141822] to-cyan-950/20'
                          : envoy.roleType === 'tax_commissioner'
                          ? 'border-amber-700/70 bg-gradient-to-br from-[#141822] via-[#141822] to-amber-950/20'
                          : 'border-purple-700/70 bg-gradient-to-br from-[#141822] via-[#141822] to-purple-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Territory Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-lg bg-[#0b0e14] border border-slate-800">
                          {territory.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-slate-100">{territory.name}</h5>
                            {isOwner ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                                👑 本盟所屬
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {territory.ownerAllianceName || '爭奪中'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            區域：<span className="text-slate-300">{territory.region}</span> · 建議境界：
                            <span className="text-amber-400 font-semibold">{territory.recommendedRealm}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px]">基礎每週歲稅</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {territory.weeklyTaxGold.toLocaleString()} 靈石
                        </span>
                      </div>
                    </div>

                    {/* Envoy Position State Display */}
                    <div className="my-3">
                      {envoy ? (
                        <div className="bg-[#0b0e14] rounded-lg p-3 border border-slate-800 space-y-2.5">
                          {/* Active Envoy Info */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">
                                駐防特使：<span className="text-amber-300">{envoy.memberName}</span>
                              </span>
                              {assignedMember && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-semibold border border-slate-700">
                                  {assignedMember.realmName}
                                </span>
                              )}
                              {assignedMember?.isPlayer && (
                                <span className="text-[10px] px-1 rounded bg-amber-500 text-slate-950 font-black">
                                  本尊親任
                                </span>
                              )}
                            </div>

                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                envoy.roleType === 'defense_envoy'
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                  : envoy.roleType === 'tax_commissioner'
                                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                                  : 'bg-purple-950 text-purple-300 border-purple-700'
                              }`}
                            >
                              {envoy.roleType === 'defense_envoy' ? (
                                <Shield className="w-3.5 h-3.5" />
                              ) : envoy.roleType === 'tax_commissioner' ? (
                                <Coins className="w-3.5 h-3.5" />
                              ) : (
                                <Scroll className="w-3.5 h-3.5" />
                              )}
                              {envoy.title}
                            </span>
                          </div>

                          {/* Live Dynamic Stat Boost Breakdown */}
                          <div className="bg-[#141822] rounded-md p-2.5 border border-slate-800 text-xs space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-amber-400" /> 該重鎮即時生效加成數據：
                            </span>

                            {envoy.roleType === 'defense_envoy' && (
                              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">護盾上限增強 (+50%)</span>
                                  <span className="font-bold text-cyan-300 font-mono">
                                    +{bonusDefenseShield.toLocaleString()} HP (總護盾: {territory.maxShieldHp.toLocaleString()})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">守城衝擊免傷</span>
                                  <span className="font-bold text-cyan-300 font-mono">35% 傷害減免抗性</span>
                                </div>
                              </div>
                            )}

                            {envoy.roleType === 'tax_commissioner' && (
                              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">每週額外增收 (+30%)</span>
                                  <span className="font-bold text-amber-300 font-mono">
                                    +{bonusTaxGold.toLocaleString()} 靈石 (總額: {Math.floor(territory.weeklyTaxGold * 1.3).toLocaleString()})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">突破至寶產出機率</span>
                                  <span className="font-bold text-amber-300 font-mono">+50% 雙倍機率</span>
                                </div>
                              </div>
                            )}

                            {envoy.roleType === 'negotiator' && (
                              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">仙盟談判戰略貢獻</span>
                                  <span className="font-bold text-purple-300 font-mono">+40 點 / 週</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">敵盟偷襲侵擾率</span>
                                  <span className="font-bold text-purple-300 font-mono">-65% (安定度 98%)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#0b0e14]/60 rounded-lg p-3 border border-dashed border-amber-900/50 space-y-2 text-center">
                          <div className="text-xs text-amber-400/90 font-bold flex items-center justify-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-500" /> 尚無特使坐鎮（處於無使節狀態）
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                            該領地目前處於基礎守備狀態，未獲取特使加成。委派長老出任使節可激活「護盾上限+50%」、「每週賦稅+30%」或「談判貢獻+40」等戰略增益！
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
                      {envoy ? (
                        <>
                          <button
                            onClick={() => onRecallEnvoy(territory.id)}
                            className="py-1 px-3 bg-[#1b2230] hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md border border-slate-700 transition-colors cursor-pointer"
                          >
                            ↩️ 召回使節
                          </button>
                          <button
                            onClick={() => handleOpenAppointModal(territory)}
                            className="py-1 px-3 bg-[#1b2230] hover:bg-amber-950/60 text-amber-300 rounded-md border border-amber-700/60 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Wrench className="w-3 h-3 text-amber-400" /> 調動職位 / 換派
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenAppointModal(territory)}
                          className="w-full sm:w-auto py-1.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-lg border border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Crown className="w-3.5 h-3.5" /> 委派長老出任特使
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Headquarters Eligible Elders Roster */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> 仙盟護法長老侍直名冊 (外交使節人選庫)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  查看仙盟同修目前在任使節或待命總舵的狀態，隨時由盟主調度聽令。
                </p>
              </div>
              <span className="text-xs text-cyan-300 font-mono font-semibold">
                在籍大能：{alliance.members.length} 位
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alliance.members.map((member) => {
                const assignedTerritory = territories.find(
                  (t) => t.appointedEnvoy?.memberId === member.id
                );

                return (
                  <div
                    key={member.id}
                    className={`bg-[#0b0e14] p-3 rounded-lg border transition-all flex flex-col justify-between ${
                      assignedTerritory
                        ? 'border-amber-600/50 bg-amber-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-200">
                            {member.name}
                          </span>
                          {member.isPlayer && (
                            <span className="text-[10px] px-1 rounded bg-amber-500 text-slate-950 font-black">
                              本尊
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {member.server}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span className="text-cyan-300">{member.realmName}</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          戰力: {member.combatPower.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs mb-2">
                        {assignedTerritory ? (
                          <div className="p-1.5 rounded bg-[#141822] border border-amber-800/60 text-amber-300 flex items-center gap-1.5 text-[11px]">
                            <Scroll className="w-3 h-3 text-amber-400" />
                            <span>
                              坐鎮：【{assignedTerritory.name.split('·')[0]}】
                              <span className="font-bold ml-1">({assignedTerritory.appointedEnvoy?.title})</span>
                            </span>
                          </div>
                        ) : (
                          <div className="p-1.5 rounded bg-[#141822] border border-slate-800 text-slate-500 text-[11px] italic">
                            待命中 · 仙盟總舵聽調
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                      <button
                        onClick={() => {
                          const targetTerritory =
                            assignedTerritory ||
                            territories.find((t) => !t.appointedEnvoy) ||
                            territories[0];
                          setSelectedMemberId(member.id);
                          handleOpenAppointModal(targetTerritory);
                        }}
                        className="py-1 px-3 bg-[#1b2230] hover:bg-amber-950/80 text-amber-300 text-xs font-semibold rounded border border-slate-700 hover:border-amber-600 transition-colors cursor-pointer"
                      >
                        {assignedTerritory ? '調整職任' : '👑 委派職務'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB: Territory Fortification UI Panel (領地防禦工事) --- */}
      {subTab === 'fortifications' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#141822] border border-cyan-800/80 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-950/80 border border-cyan-600/70 text-cyan-300 mb-2">
                  <Shield className="w-3.5 h-3.5" /> 仙盟領地防禦體系 · 陣法要塞工事
                </div>
                <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                  領地防禦工事管理 · 爭奪戰護盾加固
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  仙盟長老與盟主專屬工事權能：動用【仙盟金庫儲備】加固各大重鎮的防禦陣法與要塞工事（青木玄光陣 ➔ 厚土金剛禁制 ➔ 九天雷霄神弩塔 ➔ 兩儀微塵太極陣 ➔ 鴻蒙周天星斗帝陣），為每週萬界領地爭奪戰提供極高額的護盾 HP 增幅與攻城免傷抗性，抵禦敵對仙盟大軍攻城掠地！
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsDonateModalOpen(true)}
                  className="py-2 px-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Coins className="w-4 h-4" /> 💰 長老撥款注資金庫
                </button>
                <button
                  onClick={() => {
                    sound.playDing();
                    setSubTab('envoys');
                  }}
                  className="py-2 px-3.5 bg-[#1b2230] hover:bg-[#253043] text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> 委派聯防特使
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-950/70 border border-amber-600/40 text-amber-300">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">仙盟金庫公款儲備</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {alliance.funds.toLocaleString()} 靈石
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {alliance.funds >= 5000 ? '✅ 資金充沛' : '⚠️ 需長老注資'}
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-cyan-950/70 border border-cyan-600/40 text-cyan-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">全域護盾儲量總計</span>
                  <span className="font-bold text-cyan-300 font-mono text-sm">
                    {territories.reduce((acc, t) => acc + t.shieldHp, 0).toLocaleString()} HP
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    上限: {territories.reduce((acc, t) => acc + t.maxShieldHp, 0).toLocaleString()} HP
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-purple-950/70 border border-purple-600/40 text-purple-300">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">要塞最高工事品階</span>
                  <span className="font-bold text-purple-300 font-mono text-sm">
                    Lv.{Math.max(...territories.map((t) => t.fortificationLevel))} 階禁制
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {FORTIFICATION_TIERS.find((f) => f.level === Math.max(...territories.map((t) => t.fortificationLevel)))?.name || '青木玄光'}
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-950/70 border border-emerald-600/40 text-emerald-300">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">爭奪戰守城免傷</span>
                  <span className="font-bold text-emerald-300 font-mono text-sm">
                    +35% ~ 50%
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    有效抵禦攻城衝擊
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fortification Tiers Ladder Reference */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> 八荒防禦工事五階通神寶錄 (品階體系)
              </h4>
              <span className="text-xs text-slate-400">
                每加固一階，領地在爭奪戰中擁有的護盾 HP 與免傷能力翻倍激增！
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              {FORTIFICATION_TIERS.map((tier) => (
                <div
                  key={tier.level}
                  className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-amber-300">
                        Lv.{tier.level} {tier.name}
                      </span>
                    </div>
                    <div className="font-mono text-cyan-300 font-bold text-[11px] mb-1">
                      護盾：+{tier.shieldHp.toLocaleString()} HP
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                      {tier.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                    <span>公款造價：</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {tier.cost.toLocaleString()} 靈石
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All 5 Territories Fortification Upgrade Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" /> 八荒五大重鎮防禦工事與護盾即時加固
              </h4>
              <span className="text-xs text-slate-400">
                動用仙盟金庫儲備，為各重鎮升級要塞工事與護盾法陣
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {territories.map((territory) => {
                const isOwner = territory.ownerAllianceName === alliance.name;
                const nextTier = FORTIFICATION_TIERS.find(
                  (f) => f.level === territory.fortificationLevel + 1
                );
                const currentTier =
                  FORTIFICATION_TIERS.find((f) => f.level === territory.fortificationLevel) ||
                  FORTIFICATION_TIERS[0];
                const shieldPercent = Math.min(
                  100,
                  Math.max(0, (territory.shieldHp / territory.maxShieldHp) * 100)
                );
                const canAffordTreasury = nextTier ? alliance.funds >= nextTier.cost : false;

                return (
                  <div
                    key={territory.id}
                    className="bg-[#141822] border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between space-y-3.5"
                  >
                    <div>
                      {/* Territory Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2 rounded-lg bg-[#0b0e14] border border-slate-800">
                            {territory.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-100">{territory.name}</h5>
                              {isOwner ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                                  👑 本盟掌控
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  {territory.ownerAllianceName || '爭奪中'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              區域：<span className="text-slate-300">{territory.region}</span> · 建議境界：
                              <span className="text-amber-400 font-semibold">{territory.recommendedRealm}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-slate-400 block text-[10px]">當前陣法品階</span>
                          <span className="font-bold text-cyan-300 font-mono">
                            Lv.{territory.fortificationLevel} {territory.fortificationName}
                          </span>
                        </div>
                      </div>

                      {/* Shield Health Bar & Contention Buffs */}
                      <div className="my-3 bg-[#0b0e14] rounded-lg p-3 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-cyan-400" /> 領地護盾防護值 (爭奪戰緩衝)
                          </span>
                          <span className="font-mono text-cyan-300 font-bold">
                            {territory.shieldHp.toLocaleString()} / {territory.maxShieldHp.toLocaleString()} HP ({Math.round(shieldPercent)}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${shieldPercent}%` }}
                          />
                        </div>

                        {/* Contention Shield Buffs Breakdown */}
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-300">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">要塞陣法基底：</span>
                            <span className="font-mono text-slate-200">
                              Lv.{territory.fortificationLevel} 階禁制 (提供 {currentTier.shieldHp.toLocaleString()} HP)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">外交聯防特使加成：</span>
                            <span className="font-mono text-amber-300 font-semibold">
                              {territory.appointedEnvoy?.roleType === 'defense_envoy'
                                ? `🛡️ ${territory.appointedEnvoy.memberName} 坐鎮 (+50% 護盾加厚)`
                                : '無聯防特使 (可至特使介面委派)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">爭奪戰免傷抗性：</span>
                            <span className="font-mono text-cyan-300">
                              35% 攻城傷害減免 (敵盟需先擊破此護盾方能破城)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Upgrade Preview & Next Tier Details */}
                      {nextTier ? (
                        <div className="bg-[#141822] rounded-lg p-3 border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                              可晉升下一階：【Lv.{nextTier.level} {nextTier.name}】
                            </span>
                            <span className="text-[11px] font-mono text-cyan-300 font-bold">
                              護盾躍升至 {nextTier.shieldHp.toLocaleString()} HP
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {nextTier.desc}
                          </p>

                          {/* Funding Affordability Banner */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/70 text-[11px]">
                            <span className="text-slate-400">加固耗資 (金庫公款)：</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-amber-400 font-bold">
                                {nextTier.cost.toLocaleString()} 靈石
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                  canAffordTreasury
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : 'bg-amber-950 text-amber-300 border-amber-700'
                                }`}
                              >
                                {canAffordTreasury ? '✅ 金庫充足' : '⚠️ 金庫不足 (扣長老個人)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-700/50 text-center text-xs text-amber-300">
                          🌟 該重鎮防禦陣法已晉升至最高神階【鴻蒙周天星斗帝陣】！固若金湯，神魔莫犯！
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <button
                        onClick={() => onRepairShield(territory.id)}
                        disabled={territory.shieldHp >= territory.maxShieldHp}
                        className="py-1.5 px-3 bg-[#1b2230] hover:bg-cyan-950 text-cyan-300 border border-cyan-800/70 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5" /> 修復護盾 (-300 靈石)
                      </button>

                      {nextTier && (
                        <button
                          onClick={() => onUpgradeFortification(territory.id)}
                          className="py-1.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold rounded-lg border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Building className="w-3.5 h-3.5" /> 動用金庫加固至【{nextTier.name}】(-{nextTier.cost.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TREASURY DONATION MODAL --- */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141822] border-2 border-amber-600/80 rounded-xl p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setIsDonateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
                仙盟公款儲備 · 充實金庫
              </span>
              <h3 className="text-xl font-bold text-amber-300 mt-1">
                長老撥款注資 · 仙盟金庫
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                調撥個人靈石注入仙盟金庫，用於八荒重鎮領地防禦工事升級與護盾加固。
              </p>
            </div>

            <div className="space-y-4 mb-6 text-xs">
              <div className="flex justify-between items-center bg-[#0b0e14] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">目前仙盟金庫儲備：</span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {alliance.funds.toLocaleString()} 靈石
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#0b0e14] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">長老個人修行資產：</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">
                  {player.gold.toLocaleString()} 靈石
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  選擇注資撥款額度：
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 2000, 5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonateAmount(amt)}
                      className={`p-2.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                        donateAmount === amt
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold shadow-md'
                          : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDonateModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#1b2230] hover:bg-[#253043] text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDonateTreasury) {
                    onDonateTreasury(donateAmount);
                  }
                  setIsDonateModalOpen(false);
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                💰 確認撥款入庫
              </button>
            </div>
          </div>
        </div>
      )}
      {subTab === 'diplomatic_log' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-2">
                  <Scroll className="w-3.5 h-3.5" /> 跨服地緣政治 · 萬界風雲錄
                </div>
                <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                  仙盟政略誌 · 外交聯防歷史紀要
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  實時記錄跨服同盟最新外交談判、領地稅率整頓、長老特使職位任免與領地防禦工事加固進展。運籌帷幄於方寸，決策定八荒興衰。
                </p>
              </div>

              {/* Action Button: Convene Diplomatic Summit */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    sound.playDing();
                    setIsSummitOpen(true);
                  }}
                  className="py-2 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Feather className="w-4 h-4" /> 📜 頒發政略法旨 / 萬界會盟談判
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-purple-950/70 border border-purple-600/40 text-purple-300">
                  <Scroll className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">外交斡旋談判</span>
                  <span className="font-bold text-purple-300 font-mono text-sm">
                    {diplomaticLogs.filter((l) => l.category === 'negotiation').length} 件
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-950/70 border border-amber-600/40 text-amber-300">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">賦稅徵納變更</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {diplomaticLogs.filter((l) => l.category === 'tax').length} 件
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-cyan-950/70 border border-cyan-600/40 text-cyan-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">領地聯防工事</span>
                  <span className="font-bold text-cyan-300 font-mono text-sm">
                    {diplomaticLogs.filter((l) => l.category === 'defense').length} 件
                  </span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-950/70 border border-emerald-600/40 text-emerald-300">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">外交特使任免</span>
                  <span className="font-bold text-emerald-300 font-mono text-sm">
                    {diplomaticLogs.filter((l) => l.category === 'appointment').length} 件
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-4 shadow-md space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => {
                    sound.playDing();
                    setCategoryFilter('all');
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    categoryFilter === 'all'
                      ? 'bg-amber-600 text-slate-950 shadow-sm'
                      : 'bg-[#1b2230] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  全部政略 ({diplomaticLogs.length})
                </button>

                <button
                  onClick={() => {
                    sound.playDing();
                    setCategoryFilter('negotiation');
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    categoryFilter === 'negotiation'
                      ? 'bg-purple-600 text-slate-950 shadow-sm'
                      : 'bg-[#1b2230] text-purple-300 hover:bg-purple-950/50'
                  }`}
                >
                  📜 外交談判 ({diplomaticLogs.filter((l) => l.category === 'negotiation').length})
                </button>

                <button
                  onClick={() => {
                    sound.playDing();
                    setCategoryFilter('tax');
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    categoryFilter === 'tax'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-[#1b2230] text-amber-300 hover:bg-amber-950/50'
                  }`}
                >
                  💰 賦稅變更 ({diplomaticLogs.filter((l) => l.category === 'tax').length})
                </button>

                <button
                  onClick={() => {
                    sound.playDing();
                    setCategoryFilter('defense');
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    categoryFilter === 'defense'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-[#1b2230] text-cyan-300 hover:bg-cyan-950/50'
                  }`}
                >
                  🛡️ 領地聯防 ({diplomaticLogs.filter((l) => l.category === 'defense').length})
                </button>

                <button
                  onClick={() => {
                    sound.playDing();
                    setCategoryFilter('appointment');
                  }}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    categoryFilter === 'appointment'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-[#1b2230] text-emerald-300 hover:bg-emerald-950/50'
                  }`}
                >
                  👑 外交任免 ({diplomaticLogs.filter((l) => l.category === 'appointment').length})
                </button>
              </div>

              {/* Territory Filter Dropdown & Search */}
              <div className="flex items-center gap-2">
                <select
                  value={territoryFilter}
                  onChange={(e) => setTerritoryFilter(e.target.value)}
                  className="bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none"
                >
                  <option value="all">🌐 全部涉及領地</option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋條約、使節或關鍵字..."
                    className="bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none w-44 sm:w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Feed of Diplomatic Logs */}
          <div className="space-y-3.5">
            {diplomaticLogs
              .filter((log) => {
                if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
                if (territoryFilter !== 'all' && log.territoryName !== territoryFilter) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  const matchTitle = log.title.toLowerCase().includes(q);
                  const matchDesc = log.desc.toLowerCase().includes(q);
                  const matchActor = log.actor.toLowerCase().includes(q);
                  const matchTerritory = log.territoryName.toLowerCase().includes(q);
                  const matchImpact = log.strategicImpact.toLowerCase().includes(q);
                  if (!matchTitle && !matchDesc && !matchActor && !matchTerritory && !matchImpact) {
                    return false;
                  }
                }
                return true;
              })
              .map((log) => {
                // Category styling badges
                const categoryStyles = {
                  negotiation: {
                    border: 'border-l-4 border-l-purple-500 border-purple-900/30',
                    badgeBg: 'bg-purple-950/70 border-purple-500/50 text-purple-300',
                    label: '📜 外交斡旋談判',
                    iconColor: 'text-purple-400',
                  },
                  tax: {
                    border: 'border-l-4 border-l-amber-500 border-amber-900/30',
                    badgeBg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
                    label: '💰 領地賦稅變更',
                    iconColor: 'text-amber-400',
                  },
                  defense: {
                    border: 'border-l-4 border-l-cyan-500 border-cyan-900/30',
                    badgeBg: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
                    label: '🛡️ 領地聯防工事',
                    iconColor: 'text-cyan-400',
                  },
                  appointment: {
                    border: 'border-l-4 border-l-emerald-500 border-emerald-900/30',
                    badgeBg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
                    label: '👑 外交專職任免',
                    iconColor: 'text-emerald-400',
                  },
                }[log.category];

                return (
                  <div
                    key={log.id}
                    className={`bg-[#141822] ${categoryStyles.border} border-t border-r border-b border-slate-800/90 rounded-xl p-4 shadow-md hover:border-slate-700 transition-all`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/70">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${categoryStyles.badgeBg}`}
                        >
                          {categoryStyles.label}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 bg-[#0b0e14] px-2 py-0.5 rounded border border-slate-800">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {log.territoryName}
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-[#0b0e14] px-2 py-0.5 rounded border border-slate-800">
                          <UserCheck className="w-3 h-3 text-cyan-400" />
                          執事者：<span className="text-slate-200 font-semibold">{log.actor}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        {log.dateStr} (壽元 {log.age} 載)
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-amber-200 tracking-wide mb-1.5">
                      {log.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {log.desc}
                    </p>

                    {/* Strategic Impact Highlight Panel */}
                    <div className="bg-[#0b0e14]/90 border border-slate-800/90 rounded-lg p-2.5 flex items-start gap-2 text-xs">
                      <div className="p-1 rounded bg-amber-950/60 text-amber-400 shrink-0 mt-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-amber-300 text-[11px] mr-1.5">
                          【戰略效益與政治影響】：
                        </span>
                        <span className="text-slate-300 leading-normal">
                          {log.strategicImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Empty State */}
            {diplomaticLogs.filter((log) => {
              if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
              if (territoryFilter !== 'all' && log.territoryName !== territoryFilter) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = log.title.toLowerCase().includes(q);
                const matchDesc = log.desc.toLowerCase().includes(q);
                const matchActor = log.actor.toLowerCase().includes(q);
                const matchTerritory = log.territoryName.toLowerCase().includes(q);
                const matchImpact = log.strategicImpact.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchActor && !matchTerritory && !matchImpact) {
                  return false;
                }
              }
              return true;
            }).length === 0 && (
              <div className="bg-[#141822] border border-slate-800 rounded-xl p-12 text-center">
                <Scroll className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-400">尚無符合篩選條件的仙盟政略紀事</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  可點擊上方分類標籤切換檢索範圍，或點擊「頒發政略法旨」召開萬界議政會開闢全新政略紀元。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DIPLOMATIC SUMMIT DECREE MODAL --- */}
      {isSummitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141822] border-2 border-amber-600/80 rounded-xl p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSummitOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
                跨服仙盟 · 萬界會盟議政
              </span>
              <h3 className="text-xl font-bold text-amber-300 mt-1">
                召開仙盟政略議事會 · 頒行法旨
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                以盟主至尊之名昭告萬界，可主動締結互不侵犯協議、整頓領地賦稅，或發布全域邊防聯防動員令。
              </p>
            </div>

            <div className="space-y-4 mb-6 text-xs">
              {/* Select Decree Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  選擇政略法旨類型：
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecreeType('negotiation')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      decreeType === 'negotiation'
                        ? 'border-purple-400 bg-purple-950/50 text-purple-200 shadow-md font-bold'
                        : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Scroll className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    📜 外交和約
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecreeType('tax')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      decreeType === 'tax'
                        ? 'border-amber-400 bg-amber-950/50 text-amber-200 shadow-md font-bold'
                        : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Coins className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    💰 稅賦改制
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecreeType('defense')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      decreeType === 'defense'
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-md font-bold'
                        : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    🛡️ 邊防動員
                  </button>
                </div>
              </div>

              {/* Dynamic Target Selection */}
              {decreeType === 'negotiation' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    選擇會盟目標跨服仙盟：
                  </label>
                  <select
                    value={summitTargetRival}
                    onChange={(e) => setSummitTargetRival(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-xs text-amber-200 focus:outline-none"
                  >
                    {rivalAlliances.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.server} · 戰力:{r.power.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-purple-300/80 mt-1">
                    * 締結成功後將獲贈朝貢歲禮 1,500 靈石，雙方停止襲擾，締結萬界和平備忘。
                  </p>
                </div>
              )}

              {decreeType === 'tax' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    選擇改制與徵管重鎮：
                  </label>
                  <select
                    value={summitTargetTerritory}
                    onChange={(e) => setSummitTargetTerritory(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-xs text-amber-200 focus:outline-none"
                  >
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name} (每週稅金: {t.weeklyTaxGold} 靈石)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    * 頒布稅制整頓法旨將使該重鎮每週基礎歲稅調增 +20%，稅金累積更為迅速！
                  </p>
                </div>
              )}

              {decreeType === 'defense' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    選擇防禦工事強化防區：
                  </label>
                  <select
                    value={summitTargetTerritory}
                    onChange={(e) => setSummitTargetTerritory(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-xs text-amber-200 focus:outline-none"
                  >
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name} (護盾: {t.shieldHp}/{t.maxShieldHp} HP)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-cyan-300/80 mt-1">
                    * 發布八荒戒備令將使所轄重鎮護盾充盈 +1,000 HP，提升抵禦敵盟攻城防禦力！
                  </p>
                </div>
              )}

              {/* Custom Decree Narrative Note */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  政略法旨檄文備註 (選填)：
                </label>
                <input
                  type="text"
                  value={customDecreeNote}
                  maxLength={50}
                  onChange={(e) => setCustomDecreeNote(e.target.value)}
                  placeholder="輸入自訂法旨備註，將記入仙盟政略誌歷史紀事..."
                  className="w-full bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsSummitOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#1b2230] hover:bg-[#253043] text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onIssueDiplomaticDecree) {
                    if (decreeType === 'negotiation') {
                      const rival = rivalAlliances.find((r) => r.name === summitTargetRival) || rivalAlliances[0];
                      onIssueDiplomaticDecree(
                        'negotiation',
                        summitTargetTerritory,
                        rival.name,
                        `與【${rival.server}】${rival.name}簽署《萬界互不侵犯盟約》`,
                        customDecreeNote.trim() || `兩盟高層於天淵會盟，議定互不興兵征伐，獲贈盟約歲貢靈石 1,500 點，正道聲望顯揚。`,
                        `邊境休兵弭戰，跨界道商自由通衢，獲得朝貢靈石 +1,500 點`
                      );
                    } else if (decreeType === 'tax') {
                      const t = territories.find((item) => item.id === summitTargetTerritory) || territories[0];
                      onIssueDiplomaticDecree(
                        'tax',
                        t.id,
                        '',
                        `頒行【${t.name}】歲稅改制與靈礦增收法旨`,
                        customDecreeNote.trim() || `整頓該重鎮商行賦稅徵納，下發巡察大印，嚴格清算靈石礦產，每週基礎歲稅調增 +20%！`,
                        `重鎮每週歲稅基礎增幅 +20%，稅金累積速率顯著躍升`
                      );
                    } else if (decreeType === 'defense') {
                      const t = territories.find((item) => item.id === summitTargetTerritory) || territories[0];
                      onIssueDiplomaticDecree(
                        'defense',
                        t.id,
                        '',
                        `發布八荒領地【全域防禦戒備令】`,
                        customDecreeNote.trim() || `長老院頒下防禦戒備諭令，抽調仙盟守備軍團加固各處結界，所轄領地護盾額外加固 +1,000 HP！`,
                        `仙盟所轄全域重鎮護盾即時充盈 +1,000 HP，防禦力全面強化`
                      );
                    }
                  }
                  sound.playWarDrum();
                  setIsSummitOpen(false);
                  setCustomDecreeNote('');
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                📜 正式頒發法旨 · 銘刻政略誌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- APPOINT ENVOY MODAL --- */}
      {appointingTerritory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141822] border-2 border-amber-600/80 rounded-xl p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setAppointingTerritory(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
                仙盟外交職位委派
              </span>
              <h3 className="text-xl font-bold text-amber-300 mt-1">
                委派長老駐防議稅 · 【{appointingTerritory.name}】
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                選擇一位仙盟長老或先鋒前往該重鎮擔任外交使節，增加戰略效益與防禦聯動。
              </p>
            </div>

            <div className="space-y-4 mb-6 text-xs">
              {/* Select Member */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  選擇委派長老/道友：
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-xs text-amber-200 focus:outline-none"
                >
                  {alliance.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.server} · {m.realmName} · {m.role} · 戰力:{m.combatPower})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Diplomatic Role */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  授予外交/聯防專屬職司：
                </label>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedRoleType('defense_envoy')}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedRoleType === 'defense_envoy'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md'
                        : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      <Shield className="w-4 h-4 text-cyan-400" /> 🛡️ 領地聯防長老
                    </div>
                    <div className="text-[11px] mt-1 text-slate-300 leading-relaxed">
                      提升該重鎮護盾上限 +50%，並使防禦工事堅固耐用，在領地爭奪戰中抵禦敵盟攻勢。
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedRoleType('tax_commissioner')}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedRoleType === 'tax_commissioner'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-md'
                        : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      <Coins className="w-4 h-4 text-amber-400" /> 💰 議稅巡查特使
                    </div>
                    <div className="text-[11px] mt-1 text-slate-300 leading-relaxed">
                      嚴格巡查領地稅賦，使每週靈石歲稅額外增幅 +30%，並大幅提高突破材料收穫概率。
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedRoleType('negotiator')}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedRoleType === 'negotiator'
                        ? 'border-purple-400 bg-purple-950/40 text-purple-200 shadow-md'
                        : 'border-slate-800 bg-[#0d1016] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      <Scroll className="w-4 h-4 text-purple-400" /> 📜 萬界談判使節
                    </div>
                    <div className="text-[11px] mt-1 text-slate-300 leading-relaxed">
                      與周邊敵對勢力展開斡旋談判，建立跨界默契協議，防止周邊宵小修士突襲暗算。
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Calculated Live Bonus Preview */}
              <div className="bg-[#0b0e14] border border-amber-600/50 rounded-lg p-3 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    【{appointingTerritory.name}】委任後即時激活加成數據：
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    長老: {alliance.members.find((m) => m.id === selectedMemberId)?.name || '未選擇'}
                  </span>
                </div>

                {selectedRoleType === 'defense_envoy' && (
                  <div className="space-y-1.5 text-slate-300 pt-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🛡️ 護盾防禦上限增幅：</span>
                      <span className="font-bold text-cyan-300 font-mono">
                        {appointingTerritory.maxShieldHp.toLocaleString()} HP ➔{' '}
                        {Math.floor(appointingTerritory.maxShieldHp * 1.5).toLocaleString()} HP (+50%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">⚔️ 守城攻防減免：</span>
                      <span className="font-bold text-cyan-300">35% 攻城傷害免傷抗性</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🏯 大陣堅固度：</span>
                      <span className="font-bold text-cyan-300">防禦結界反震敵修，維護耗損減半</span>
                    </div>
                  </div>
                )}

                {selectedRoleType === 'tax_commissioner' && (
                  <div className="space-y-1.5 text-slate-300 pt-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">💰 每週靈石歲稅增幅：</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {appointingTerritory.weeklyTaxGold.toLocaleString()} 靈石 ➔{' '}
                        {Math.floor(appointingTerritory.weeklyTaxGold * 1.3).toLocaleString()} 靈石/週 (+30%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">💎 突破至寶產出：</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {appointingTerritory.specialResource} (雙倍收穫機率 +50%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">⚖️ 靈礦採掘稽核：</span>
                      <span className="font-bold text-amber-300">杜絕私採私扣，歲賦全額入庫</span>
                    </div>
                  </div>
                )}

                {selectedRoleType === 'negotiator' && (
                  <div className="space-y-1.5 text-slate-300 pt-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">📜 仙盟每週談判貢獻：</span>
                      <span className="font-bold text-purple-300 font-mono">+40 點 / 週 (增長仙盟政略地位)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🕊️ 敵盟偷襲侵擾威懾：</span>
                      <span className="font-bold text-purple-300">-65% 掠奪機率 (邊界安全度 98%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🤝 跨界商道朝貢禮金：</span>
                      <span className="font-bold text-purple-300 font-mono">+800 靈石 / 週 (通商歲貢)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAppointingTerritory(null)}
                className="flex-1 py-2.5 px-4 bg-[#1b2230] hover:bg-[#253043] text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAppoint}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                頒發仙盟法旨 · 正式委派
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TECH NODE INSPECT & DAO COMPREHENSION MODAL --- */}
      {inspectingTechNode && alliance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121620] border-2 border-amber-500/70 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-[0_0_35px_rgba(245,158,11,0.3)] relative">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-[#0a0d13] border border-amber-500/50 shadow-inner">
                  {inspectingTechNode.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-600">
                      Tier {inspectingTechNode.level} 陣階
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {inspectingTechNode.branch === 'spirit'
                        ? '🌸 聚靈道系'
                        : inspectingTechNode.branch === 'war'
                        ? '⚔️ 戰陣殺伐'
                        : '🪙 金庫司管'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-amber-200 mt-0.5">
                    {inspectingTechNode.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setInspectingTechNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lore script */}
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
              <span className="text-[10px] text-amber-400 font-bold block mb-1">
                📜 天道陣銘傳承古卷：
              </span>
              {inspectingTechNode.desc}
            </div>

            {/* Benefit Breakdown */}
            <div className="bg-gradient-to-r from-[#181f2c] to-[#121722] p-3.5 rounded-xl border border-amber-600/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> 永久全盟增益賦能：
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  {inspectingTechNode.benefitTitle}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-normal pl-5 border-l-2 border-amber-500/70">
                {inspectingTechNode.benefitDesc}
              </p>
            </div>

            {/* Cost & Requirements */}
            {(() => {
              const curLevel =
                inspectingTechNode.branch === 'spirit'
                  ? alliance.spiritArrayLevel
                  : inspectingTechNode.branch === 'war'
                  ? alliance.warArrayLevel
                  : alliance.treasuryLevel;
              const isResearched = curLevel >= inspectingTechNode.level;
              const isResearchable = curLevel === inspectingTechNode.level - 1;
              const hasGold = player.gold >= inspectingTechNode.costGold;
              const hasContrib = playerContribution >= inspectingTechNode.costContribution;
              const canAfford = hasGold && hasContrib;

              return (
                <div className="space-y-3">
                  {!isResearched && (
                    <div className="bg-[#0a0d14] p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                      <span className="text-[11px] text-slate-400 block font-bold">
                        參悟消耗資產核驗：
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className={`p-2 rounded-lg border text-center ${
                            hasGold
                              ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-700/60 text-rose-300'
                          }`}
                        >
                          <span className="text-[10px] block opacity-80">💎 靈石需求</span>
                          <span className="font-mono font-bold text-xs">
                            {inspectingTechNode.costGold.toLocaleString()}
                          </span>
                          <span className="text-[10px] block opacity-70">
                            (現有: {player.gold.toLocaleString()})
                          </span>
                        </div>

                        <div
                          className={`p-2 rounded-lg border text-center ${
                            hasContrib
                              ? 'bg-cyan-950/30 border-cyan-700/60 text-cyan-300'
                              : 'bg-rose-950/30 border-rose-700/60 text-rose-300'
                          }`}
                        >
                          <span className="text-[10px] block opacity-80">🎖️ 仙盟戰功需求</span>
                          <span className="font-mono font-bold text-xs">
                            {inspectingTechNode.costContribution} 點
                          </span>
                          <span className="text-[10px] block opacity-70">
                            (現有: {playerContribution} 點)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setInspectingTechNode(null)}
                      className="flex-1 py-2.5 px-4 bg-[#1b2230] hover:bg-[#253043] text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      關閉
                    </button>

                    {isResearched ? (
                      <button
                        disabled
                        className="flex-1 py-2.5 px-4 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-default"
                      >
                        <Check className="w-4 h-4" /> 陣脈已大成生效中
                      </button>
                    ) : isResearchable ? (
                      <button
                        onClick={() => {
                          if (!canAfford) {
                            alert('靈石或戰功不足！可透過領地巡哨或注資金庫獲取戰功！');
                            return;
                          }
                          onUpgradeTech(
                            inspectingTechNode.branch,
                            inspectingTechNode.costGold,
                            inspectingTechNode.costContribution,
                            inspectingTechNode.name,
                            inspectingTechNode.level
                          );
                          setInspectingTechNode(null);
                        }}
                        className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                            : 'bg-[#181d28] border-rose-700 text-rose-300'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        {canAfford ? '立刻參悟研發此陣階' : '資產不足 · 無法參悟'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-500 text-xs rounded-lg flex items-center justify-center gap-1 cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" /> 需前置陣脈 (第 {inspectingTechNode.level - 1} 階)
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- Scripture Lore & Detail Modal --- */}
      {inspectingScripture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/70 rounded-xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.4)] text-slate-200">
            {/* Close button */}
            <button
              onClick={() => setInspectingScripture(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500 flex items-center justify-center text-2xl shrink-0">
                {inspectingScripture.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-950 text-purple-300 border border-purple-700">
                    {inspectingScripture.rarity === 'mythic' ? '神品道藏' : inspectingScripture.rarity === 'legendary' ? '仙階絕典' : '玄門古卷'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    當前修煉：第 {player.unlockedScriptures?.[inspectingScripture.id] || 0} 重 / 共 {inspectingScripture.maxLevel} 重
                  </span>
                </div>
                <h3 className="text-lg font-bold text-amber-200 mt-0.5">
                  {inspectingScripture.name}
                </h3>
              </div>
            </div>

            {/* Lore and Mantra */}
            <div className="space-y-4 mb-6">
              <div className="bg-[#0e1117] p-3 rounded-lg border border-purple-900/50">
                <span className="text-[10px] text-purple-300 font-bold block mb-1">【道藏真意口訣】</span>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{inspectingScripture.quote}"
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">【神通奧義說明】</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {inspectingScripture.desc}
                </p>
              </div>

              {/* Tier Progression Breakdown */}
              <div>
                <span className="text-xs font-bold text-amber-300 block mb-2">【五重天道玄奧梯次】</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {Array.from({ length: inspectingScripture.maxLevel }).map((_, idx) => {
                    const tierLvl = idx + 1;
                    const curLvl = player.unlockedScriptures?.[inspectingScripture.id] || 0;
                    const isUnlocked = curLvl >= tierLvl;
                    const isCurrent = curLvl === tierLvl;
                    const tierCost = inspectingScripture.baseCost + (tierLvl - 1) * inspectingScripture.costPerLevel;
                    const val = tierLvl * inspectingScripture.valuePerLevel;

                    return (
                      <div
                        key={tierLvl}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-sm'
                            : isUnlocked
                            ? 'bg-[#10141e] border-emerald-800/60 text-emerald-300'
                            : 'bg-[#0d1017] border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-300">第 {tierLvl} 重</span>
                          <span>
                            {inspectingScripture.effectType === 'crit_chance'
                              ? `暴擊率 +${val}%`
                              : inspectingScripture.effectType === 'meditation_exp'
                              ? `閉關修為 +${val}%`
                              : inspectingScripture.effectType === 'crit_damage'
                              ? `暴擊傷害 +${val}%`
                              : inspectingScripture.effectType === 'damage_reduction'
                              ? `傷害減免 +${val}%`
                              : inspectingScripture.effectType === 'bonus_lifespan'
                              ? `壽元延長 +${val} 年`
                              : `靈石繳獲 +${val}%`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> 已悟透
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400">
                              需 {tierCost} 戰功
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {(() => {
              const curLvl = player.unlockedScriptures?.[inspectingScripture.id] || 0;
              const isMax = curLvl >= inspectingScripture.maxLevel;
              const nextLvl = curLvl + 1;
              const cost = inspectingScripture.baseCost + curLvl * inspectingScripture.costPerLevel;
              const canAfford = playerContribution >= cost;

              return (
                <div className="flex gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setInspectingScripture(null)}
                    className="flex-1 py-2.5 px-4 bg-[#1b2230] hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    關閉道卷
                  </button>

                  {!isMax ? (
                    <button
                      onClick={() => {
                        if (!canAfford) {
                          alert('仙盟戰功不足！可透過八荒領地巡守、向金庫注資或領地徵稅快速積累戰功！');
                          return;
                        }
                        if (onUnlockScripture) {
                          onUnlockScripture(inspectingScripture.id, cost);
                        }
                        setInspectingScripture(null);
                      }}
                      disabled={!canAfford}
                      className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                          : 'bg-[#181d28] border-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      {curLvl === 0 ? `參悟解鎖第 1 重 (${cost} 戰功)` : `進階至第 ${nextLvl} 重 (${cost} 戰功)`}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2.5 px-4 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-default"
                    >
                      <Check className="w-4 h-4" /> 功法已臻極境
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
