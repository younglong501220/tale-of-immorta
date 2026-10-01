import React, { useState } from 'react';
import { Item, ItemType, Player } from '../types/game';
import { sound } from '../utils/audio';
import { Backpack, Sparkles, Heart, BookOpen, Coins, Trash2 } from 'lucide-react';

interface Props {
  player: Player;
  onUseItem: (index: number) => void;
  onSellItem: (index: number) => void;
}

export const BagTab: React.FC<Props> = ({ player, onUseItem, onSellItem }) => {
  const [filterType, setFilterType] = useState<'all' | ItemType>('all');

  const filteredItems = player.inventory
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => filterType === 'all' || item.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-1">
            <Backpack className="w-3.5 h-3.5" /> 須彌芥子空間
          </div>
          <h2 className="text-xl font-bold text-amber-200">
            儲物仙戒所藏靈寶 ({player.inventory.length} 件)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            盛放各類突破天地靈物、療傷修為仙丹、神功秘法。可隨時吞服丹藥或變賣獲取靈石。
          </p>
        </div>

        {/* Filter Controls (Interactive Segmented Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-[#0d1016] border border-[#202738] rounded-lg self-start md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            全部藏品
          </button>
          <button
            onClick={() => setFilterType('material')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterType === 'material'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            突破靈物
          </button>
          <button
            onClick={() => setFilterType('pill')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterType === 'pill'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            靈丹妙藥
          </button>
          <button
            onClick={() => setFilterType('manual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterType === 'manual'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            功法秘籍
          </button>
        </div>
      </div>

      {/* Bag Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#141822] border border-[#273042] rounded-xl p-12 text-center text-slate-500 text-sm">
          <Backpack className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          該類別下空空如也... 可前往大荒歷練、宗門換取或萬寶閣競拍獲取靈寶！
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(({ item, originalIndex }) => {
            const isUsable = item.type === 'pill' || item.type === 'manual';

            return (
              <div
                key={`${item.id}-${originalIndex}`}
                className="bg-[#141822] border border-[#273042] hover:border-slate-600 rounded-xl p-4.5 flex flex-col justify-between shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-amber-300 text-sm leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium shrink-0">
                      {item.type === 'material' ? '突破靈物' : item.type === 'pill' ? '丹藥' : '功法秘籍'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-12">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  {isUsable && (
                    <button
                      onClick={() => {
                        sound.playDing();
                        onUseItem(originalIndex);
                      }}
                      className="flex-1 py-1.5 px-3 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      {item.type === 'pill' ? <Heart className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      {item.type === 'pill' ? '吞服靈丹' : '參悟秘籍'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playCoin();
                      onSellItem(originalIndex);
                    }}
                    className={`py-1.5 px-3 bg-[#1c222e] hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      isUsable ? 'shrink-0' : 'w-full'
                    }`}
                    title="變賣為靈石"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    變賣 (+{item.price || 50} 靈石)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
