export type TraitRarity = 'red' | 'orange' | 'purple' | 'blue';

export interface Trait {
  id: string;
  name: string;
  rarity: TraitRarity;
  desc: string;
  atk?: number;
  def?: number;
  int?: number;
  luk?: number;
  hp?: number;
  lifespan?: number;
  gold?: number;
  expBoost?: number;
  special?: 'crit' | 'lifesteal' | 'dodge' | 'shield';
}

export interface Destiny {
  id: string;
  name: string;
  desc: string;
  rarity: 'red' | 'orange' | 'gold';
  effectType: 'twin_spirit' | 'yellow_turban' | 'blood_drain' | 'sword_spirit' | 'thunder_dash' | 'mushroom_friend' | 'spirit_shield' | 'sword_mastery';
}

export interface Realm {
  index: number;
  name: string;
  maxExp: number;
  maxHp: number;
  atk: number;
  def: number;
  lifespan: number;
  matRequired: string | null;
  tribulationDamage: number;
  desc: string;
}

export type ItemType = 'material' | 'pill' | 'manual' | 'treasure';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  desc: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect?: {
    healHp?: number;
    addExp?: number;
    addAtk?: number;
    addDef?: number;
    addLifespan?: number;
    addInt?: number;
  };
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  realmName: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  isCultivator: boolean;
  dropGold: number;
  dropItem?: Item;
}

export type SectType = 'righteous' | 'demonic';
export type SectRank = '外門弟子' | '內門弟子' | '執事長老' | '宗門長老' | '掌門至尊';

export interface Sect {
  id: string;
  name: string;
  type: SectType;
  motto: string;
  rank: SectRank;
  points: number;
  salary: number;
}

export interface SectMission {
  id: string;
  title: string;
  desc: string;
  reqExpMonths: number;
  ptsGain: number;
  goldGain: number;
  expGain: number;
}

export interface AuctionItem {
  id: string;
  item: Item;
  currentBid: number;
  originalPrice: number;
  holder: string;
  isPlayerWinning: boolean;
  bidsCount: number;
}

export interface LogEntry {
  id: string;
  age: number;
  text: string;
  colorType: 'gold' | 'red' | 'cyan' | 'purple' | 'normal';
}

export type DiplomaticRoleType = 'negotiator' | 'defense_envoy' | 'tax_commissioner';

export type DiplomaticLogCategory = 'negotiation' | 'tax' | 'defense' | 'appointment';

export interface DiplomaticLogEntry {
  id: string;
  age: number;
  dateStr: string;
  category: DiplomaticLogCategory;
  territoryName: string;
  title: string;
  desc: string;
  actor: string;
  strategicImpact: string;
}

export interface TerritoryEnvoy {
  memberId: string;
  memberName: string;
  roleType: DiplomaticRoleType;
  title: string;
  bonusDesc: string;
}

export interface AllianceMember {
  id: string;
  name: string;
  server: string;
  realmName: string;
  combatPower: number;
  role: '盟主' | '副盟主' | '護法長老' | '征戰先鋒' | '盟眾';
  contribution: number;
  isPlayer?: boolean;
  assignedTerritoryId?: string | null;
  assignedRoleTitle?: string | null;
}

export interface TechNode {
  id: string;
  branch: 'spirit' | 'war' | 'treasury';
  level: number;
  name: string;
  desc: string;
  icon: string;
  costGold: number;
  costContribution: number;
  benefitTitle: string;
  benefitDesc: string;
}

export interface AllianceScripture {
  id: string;
  name: string;
  category: 'combat' | 'cultivation' | 'defense' | 'fortune';
  rarity: 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
  maxLevel: number;
  baseCost: number;
  costPerLevel: number;
  effectType:
    | 'crit_chance'
    | 'meditation_exp'
    | 'crit_damage'
    | 'damage_reduction'
    | 'bonus_lifespan'
    | 'explore_gold';
  valuePerLevel: number;
  unit: string;
  quote: string;
  desc: string;
}

export interface MeritShopItem {
  id: string;
  name: string;
  category: 'elixir' | 'special' | 'talisman' | 'cultivation';
  rarity: 'epic' | 'legendary' | 'mythic';
  icon: string;
  costContribution: number;
  stockLimit: number;
  desc: string;
  effectDesc: string;
  item: Item;
}

export interface ImmortalAlliance {
  id: string;
  name: string;
  level: number;
  motto: string;
  crest: string;
  role: '盟主' | '副盟主' | '護法長老' | '征戰先鋒' | '盟眾';
  membersCount: number;
  totalPower: number;
  serverOrigin: string;
  funds: number;
  spiritArrayLevel: number; // 聚靈大陣 (+修為獲取)
  warArrayLevel: number;    // 戰陣殺伐 (+攻防)
  treasuryLevel: number;    // 仙盟金庫 (+領地稅收倍率)
  members: AllianceMember[];
}

export interface DomainTerritory {
  id: string;
  name: string;
  region: string;
  icon: string;
  desc: string;
  recommendedRealm: string;
  ownerAllianceName: string | null;
  ownerServer: string;
  weeklyTaxGold: number;
  specialResource: string;
  unclaimedTaxGold: number;
  unclaimedResourceCount: number;
  defensePower: number;
  championName: string;
  championHp: number;
  championAtk: number;
  championDef: number;
  // Fortification & Defense shield
  fortificationLevel: number;
  fortificationName: string;
  shieldHp: number;
  maxShieldHp: number;
  // Diplomatic Envoy appointment
  appointedEnvoy: TerritoryEnvoy | null;
}

export interface RivalAlliance {
  id: string;
  name: string;
  server: string;
  leader: string;
  power: number;
  motto: string;
  occupiedCount: number;
}

export interface DomainContentionState {
  round: number;
  phase: 'battle' | 'settlement' | 'preparation';
  rivalAlliances: RivalAlliance[];
  territories: DomainTerritory[];
  warNews: {
    id: string;
    text: string;
    type: 'conquer' | 'tax' | 'clash' | 'info';
  }[];
}

export interface Player {
  name: string;
  gender: 'male' | 'female';
  title: string;
  realmIdx: number;
  hp: number;
  maxHp: number;
  exp: number;
  atk: number;
  def: number;
  int: number;
  luk: number;
  gold: number;
  age: number;
  maxAge: number;
  traits: Trait[];
  destinies: Destiny[];
  inventory: Item[];
  sect: Sect | null;
  alliance: ImmortalAlliance | null;
  killCount: number;
  demonicKarma: number;
  righteousKarma: number;
  equippedSkills: string[];
  unlockedScriptures?: Record<string, number>;
  meritShopPurchases?: Record<string, number>;
}

