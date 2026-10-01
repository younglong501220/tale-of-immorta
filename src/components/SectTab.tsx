import React, { useState } from 'react';
import { Item, Player, SectRank, SectType } from '../types/game';
import { SCRIPTURE_PAVILION_ITEMS } from '../data/gameData';
import { sound } from '../utils/audio';
import { Landmark, Shield, Swords, Award, BookOpen, Coins, CheckCircle, ChevronRight } from 'lucide-react';

interface Props {
  player: Player;
  onJoinSect: (name: string, type: SectType) => void;
  onDoSectMission: () => void;
  onClaimSalary: () => void;
  onPromoteRank: () => void;
  onBuyScriptureItem: (item: Item, ptsCost: number) => void;
}

export const SectTab: React.FC<Props> = ({
  player,
  onJoinSect,
  onDoSectMission,
  onClaimSalary,
  onPromoteRank,
  onBuyScriptureItem,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hall' | 'scripture'>('hall');

  if (!player.sect) {
    return (
      <div className="space-y-6">
        {/* Unjoined Banner */}
        <div className="relative rounded-xl overflow-hidden border border-amber-900/40 shadow-2xl h-44 flex flex-col justify-end p-6 bg-gradient-to-t from-[#0e1117] via-[#0e1117]/80 to-transparent">
          <img
            src="/src/assets/images/xianxia_sect_sanctuary_1790696995924.jpg"
            alt="宗門仙山"
            className="absolute inset-0 w-full h-full object-cover object-center -z-10 brightness-60 contrast-125"
          />
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-amber-200">
              天下宗門 · 正道與魔宗爭雄
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              孤身散修寸步難行，拜入宗派可享每月供奉、領取歷練懸賞，並於藏經閣修得無上神通！
            </p>
          </div>
        </div>

        {/* Sect Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Righteous */}
          <div className="bg-[#141822] border border-cyan-800/60 hover:border-cyan-500 rounded-xl p-6 flex flex-col justify-between shadow-lg transition-all group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">🕊️</span>
                <div>
                  <h3 className="text-lg font-bold text-cyan-300">萬劍正宗 (正道名門)</h3>
                  <span className="text-[11px] text-slate-400">大道至簡 · 正氣浩然</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                八荒第一正派名門，以劍證道。弟子修為獲取穩健，長老每季定期發放豐厚靈石與護心靈丹。
              </p>
              <div className="bg-[#0e1219] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 mb-6">
                <div>✦ 門派福利：靈石俸祿高，藏經閣收錄眾多玄門上乘劍訣</div>
                <div>✦ 宗門道規：嚴禁殘害同道同門</div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playBreakthrough();
                onJoinSect('萬劍正宗', 'righteous');
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-extrabold text-xs rounded-lg border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              拜入【萬劍正宗】山門
            </button>
          </div>

          {/* Demonic */}
          <div className="bg-[#141822] border border-rose-800/60 hover:border-rose-500 rounded-xl p-6 flex flex-col justify-between shadow-lg transition-all group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-rose-950 text-rose-300 border border-rose-800">🩸</span>
                <div>
                  <h3 className="text-lg font-bold text-rose-400">九幽魔煞宗 (魔道至尊)</h3>
                  <span className="text-[11px] text-slate-400">弱肉強食 · 霸道奪天</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                以血煞煉心，肆意妄為。崇尚實力至上，攻擊力暴漲，長老弟子皆可奪寶爭位，殺伐果斷！
              </p>
              <div className="bg-[#0e1219] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 mb-6">
                <div>✦ 門派特權：攻擊殺傷力大幅增幅，殺人奪寶不增心魔反噬</div>
                <div>✦ 宗門道規：若實力不足將被同門當作鼎爐</div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playBreakthrough();
                onJoinSect('九幽魔煞宗', 'demonic');
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-800 to-red-800 hover:from-rose-700 hover:to-red-700 text-amber-100 font-extrabold text-xs rounded-lg border border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer"
            >
              投身【九幽魔煞宗】魔門
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Already joined sect
  const sect = player.sect;
  const rankNames: SectRank[] = ['外門弟子', '內門弟子', '執事長老', '宗門長老', '掌門至尊'];
  const curRankIdx = rankNames.indexOf(sect.rank);
  const nextRank = curRankIdx < rankNames.length - 1 ? rankNames[curRankIdx + 1] : null;
  const reqPtsForNext = (curRankIdx + 1) * 200;

  return (
    <div className="space-y-6">
      {/* Sect Sanctuary Card */}
      <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sect.type === 'righteous' ? '🕊️' : '🩸'}</span>
              <h2 className="text-xl font-bold text-amber-300">{sect.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                {sect.type === 'righteous' ? '正道聖地' : '魔道巨擘'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{sect.motto}</p>
          </div>

          <div className="flex gap-4 bg-[#0e1117] p-3 rounded-lg border border-[#222a3a] text-xs">
            <div>
              <span className="text-slate-400 block">弟子職位</span>
              <span className="font-bold text-cyan-300 text-sm">{sect.rank}</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block">宗門貢獻點</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {sect.points} 點
              </span>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveSubTab('hall')}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'hall'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            🏛️ 宗門大殿事務
          </button>
          <button
            onClick={() => setActiveSubTab('scripture')}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'scripture'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-[#1b2230] text-slate-300 hover:text-white'
            }`}
          >
            📜 宗門藏經閣 (功法秘笈兌換)
          </button>
        </div>
      </div>

      {activeSubTab === 'hall' ? (
        /* Hall Tab: Missions, Stipend, Promotion */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mission */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-slate-200 text-sm">宗門懸賞懸壺降妖</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                下山替宗門清理禍患、採集礦物或誅殺叛逆弟子。完成可得宗門貢獻與修為靈石！
              </p>
              <div className="bg-[#0e1117] p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 mb-4">
                <div>+50 點 宗門貢獻</div>
                <div>+90 點 修為積累</div>
                <div>+120 點 靈石賞賜</div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playDing();
                onDoSectMission();
              }}
              className="w-full py-2 px-3 bg-[#1b2230] hover:bg-[#253045] border border-cyan-700/60 hover:border-cyan-500 text-cyan-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              領取並完成懸賞 (+貢獻/修為)
            </button>
          </div>

          {/* Stipend */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-slate-200 text-sm">領取弟子月度俸祿</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                宗門每月向門內弟子發放修行俸祿。職位越高，俸祿待遇愈發豐厚！
              </p>
              <div className="bg-[#0e1117] p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 mb-4">
                <div>
                  當前身份待遇：
                  <span className="font-bold text-amber-400">
                    {sect.rank === '掌門至尊' ? '1,500' : sect.rank.includes('長老') ? '600' : '200'} 靈石
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playCoin();
                onClaimSalary();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-lg border border-amber-300 shadow-sm transition-all cursor-pointer"
            >
              💰 領取每月修仙俸祿
            </button>
          </div>

          {/* Promotion */}
          <div className="bg-[#141822] border border-[#273042] rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-5 h-5 text-rose-400" />
                <h4 className="font-bold text-slate-200 text-sm">宗門晉升大比比武</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                累積足夠貢獻點後，可於演武場發起同門大比，力壓群雄晉升更高職位！
              </p>
              <div className="bg-[#0e1117] p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1 mb-4">
                {nextRank ? (
                  <div>
                    晉升目標：<span className="text-cyan-300 font-semibold">{nextRank}</span> (需 {reqPtsForNext} 貢獻)
                  </div>
                ) : (
                  <div className="text-amber-400 font-bold">已至掌門至尊，執掌一派乾坤！</div>
                )}
              </div>
            </div>
            <button
              onClick={onPromoteRank}
              disabled={!nextRank || sect.points < reqPtsForNext}
              className="w-full py-2 px-3 bg-[#1b2230] hover:bg-[#253045] disabled:opacity-40 border border-slate-700 hover:border-amber-500 text-amber-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              ⚔️ 晉升大比 (力爭長老/掌門)
            </button>
          </div>
        </div>
      ) : (
        /* Scripture Pavilion Tab */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> 藏經閣寶藏 · 貢獻點兌換
            </h3>
            <span className="text-xs text-slate-400">可用宗門貢獻點進行無償兌換</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCRIPTURE_PAVILION_ITEMS.map((itemObj) => {
              const canRedeem = sect.points >= itemObj.ptsCost;
              return (
                <div
                  key={itemObj.item.id}
                  className="bg-[#141822] border border-[#273042] rounded-xl p-4.5 flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-amber-300 text-sm">{itemObj.item.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium shrink-0">
                        {itemObj.item.type === 'manual' ? '心法秘籍' : itemObj.item.type === 'material' ? '突破靈物' : '靈丹'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-10">
                      {itemObj.item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {itemObj.ptsCost} 點貢獻
                    </span>
                    <button
                      onClick={() => {
                        sound.playCoin();
                        onBuyScriptureItem(itemObj.item, itemObj.ptsCost);
                      }}
                      disabled={!canRedeem}
                      className="py-1.5 px-3 bg-[#1c2331] hover:bg-amber-600 hover:text-slate-950 disabled:opacity-40 border border-slate-700 hover:border-amber-400 text-slate-200 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      兌換秘笈
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
