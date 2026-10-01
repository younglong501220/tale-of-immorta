import React from 'react';
import { AuctionItem, Player } from '../types/game';
import { sound } from '../utils/audio';
import { Landmark, RefreshCw, Gavel, Skull, Sparkles, Coins, ShoppingBag } from 'lucide-react';

interface Props {
  player: Player;
  auctionList: AuctionItem[];
  onBid: (index: number) => void;
  onAmbush: (index: number) => void;
  onRefreshAuction: () => void;
}

export const AuctionTab: React.FC<Props> = ({
  player,
  auctionList,
  onBid,
  onAmbush,
  onRefreshAuction,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141822] border border-[#273042] rounded-xl p-5 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300 mb-1">
            <Landmark className="w-3.5 h-3.5" /> 萬寶閣拍賣盛典
          </div>
          <h2 className="text-xl font-bold text-amber-200">
            八荒萬寶閣十年一度拍賣大會
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            爭奪突破極品靈物！若靈石短缺無法競標，亦可在會後「尾隨截殺」得主，殺人奪戒！（修仙界弱肉強食）
          </p>
        </div>

        <button
          onClick={onRefreshAuction}
          className="py-2.5 px-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-lg border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> 🔄 推進 10 年 · 刷新拍賣品
        </button>
      </div>

      {/* Auction Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {auctionList.map((auction, idx) => {
          const isPlayerTop = auction.holder === player.name;
          const nextBidPrice = auction.currentBid + (auction.currentBid > 3000 ? 500 : 200);
          const canAfford = player.gold >= nextBidPrice;

          return (
            <div
              key={auction.id}
              className={`bg-[#141822] rounded-xl p-5 border flex flex-col justify-between transition-all shadow-md ${
                isPlayerTop
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-b from-[#181e2b] to-[#141822]'
                  : 'border-[#273042] hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-amber-300 text-base leading-snug">
                    {auction.item.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium shrink-0">
                    {auction.item.type === 'material' ? '突破靈物' : auction.item.type === 'pill' ? '神丹' : '秘籍'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-12">
                  {auction.item.desc}
                </p>

                <div className="bg-[#0e1117] p-3 rounded-lg border border-[#202736] space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">當前拍賣競價:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {auction.currentBid.toLocaleString()} 靈石
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">目前暫居得主:</span>
                    <span className={`font-semibold ${isPlayerTop ? 'text-emerald-400' : 'text-cyan-300'}`}>
                      {isPlayerTop ? '👑 你 (領先中)' : auction.holder}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    sound.playCoin();
                    onBid(idx);
                  }}
                  disabled={isPlayerTop || !canAfford}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isPlayerTop
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 cursor-default'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border border-amber-300 shadow-sm'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  {isPlayerTop ? '已奪得此物 (成交入囊)' : `💰 競價加碼 (+${nextBidPrice - auction.currentBid} 靈石)`}
                </button>

                {!isPlayerTop && (
                  <button
                    onClick={() => {
                      sound.playSlash();
                      onAmbush(idx);
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 text-rose-200 border border-rose-700/80 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(225,29,72,0.4)]"
                  >
                    <Skull className="w-3.5 h-3.5 text-rose-400" /> 🗡️ 尾隨截殺【{auction.holder}】奪寶！
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
