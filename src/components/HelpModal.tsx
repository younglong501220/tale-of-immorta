import React from 'react';
import { X, Sparkles, BookOpen, Swords, Zap, Landmark, Hourglass } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141822] border-2 border-amber-600/80 rounded-xl p-6 shadow-2xl text-slate-200 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-300">
            ✦ 《鬼谷八荒·逆天改命》 遊戲指南 ✦
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            修仙之道，逆天而行。天地不仁，以萬物為芻狗。
          </p>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="bg-[#1b212d] p-3.5 rounded-lg border border-slate-700/80">
            <h4 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> 1. 先天氣運洗練
            </h4>
            <p>
              開局轉世之時，可無限制隨機骰取三條先天氣運。抽中珍貴神級紅光（如【鬼谷內門】、【龍皇真骨】、【武法精通】）時可點擊鎖頭鎖定，繼續洗練剩餘槽位！
            </p>
          </div>

          <div className="bg-[#1b212d] p-3.5 rounded-lg border border-slate-700/80">
            <h4 className="font-bold text-yellow-300 text-sm mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" /> 2. 境界突破、渡天道雷劫與逆天改命
            </h4>
            <p>
              境界劃分為：<strong>練氣 ➔ 築基 ➔ 金丹 ➔ 具靈 ➔ 元嬰 ➔ 化神 ➔ 悟道登仙</strong>。
              當修為積累圓滿並湊齊必備天地靈物（如天道之氣、九品金丹靈珠等），即可引動九天雷劫！渡劫成功後，天道垂青，可從三個神級【逆天改命】（雙靈共生、血魔大法吸血、劍靈入門等）中自選一項終身被動！
            </p>
          </div>

          <div className="bg-[#1b212d] p-3.5 rounded-lg border border-amber-600/70">
            <h4 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-1.5">
              <span className="text-base">👑</span> 3. 跨服仙盟 · 領地爭奪、外交職司、防禦工事與政略誌
            </h4>
            <p>
              修士可創立跨服仙盟自任【盟主】，或拜入各大跨界巨頭同盟。參與每週「萬界領地爭奪戰」，進攻永寧青靈礦脈、雷澤九天雷池、華封長生藥谷、雲陌天晶天脈與中州天帝神城！
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300 text-[11px]">
              <li><strong>【八荒領地稅收權】</strong>：每週持續徵收巨額靈石賦稅，產出具靈仙芝、元嬰天髓與鴻蒙道果等稀世至寶！</li>
              <li><strong>【仙盟天道科技樹】</strong>：全盟同修消耗靈石與戰功參悟「聚靈大陣 (修為倍率)」、「誅仙戰陣 (攻防戰力)」與「乾坤金庫 (賦稅增幅)」，賦予全體成員永久增益！</li>
              <li><strong>【仙盟藏經閣】</strong>：消耗個人仙盟戰功參研先賢道藏，解鎖永久生效之被動神通，包含「大幅提升鬥法暴擊機率」、「洞府閉關修為巨幅倍增」、「暴擊致命傷害」、「生死鬥法減傷」與「逆天增壽」等！</li>
              <li><strong>【外交職位委派】</strong>：盟主可委派長老擔任「領地聯防長老」、「議稅巡查特使」或「萬界談判使節」，各具強大戰略加成。</li>
              <li><strong>【領地防禦工事】</strong>：消耗資金將陣法由「青木玄光陣」一路晉階至「鴻蒙周天星斗帝陣」，提升護盾抵禦敵盟攻勢。</li>
              <li><strong>【仙盟政略誌】</strong>：實時追蹤條約談判、稅制變更、長老任免與邊防紀事，更能召開萬界議政會頒布政略法旨！</li>
            </ul>
          </div>

          <div className="bg-[#1b212d] p-3.5 rounded-lg border border-slate-700/80">
            <h4 className="font-bold text-rose-400 text-sm mb-1 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-rose-400" /> 4. 萬寶閣拍賣行 & 尾隨截殺奪寶 (經典還原)
            </h4>
            <p>
              萬寶閣十年一度舉行盛大拍賣，盛產各類極品突破靈物。若靈石足夠可直接加價競拍；若靈石不足，亦可在會後點擊<strong>【尾隨截殺奪寶】</strong>，在野外擊殺拍得靈物的修士，奪取其儲物戒指獲得寶物與大筆無主靈石！
            </p>
          </div>

          <div className="bg-[#1b212d] p-3.5 rounded-lg border border-slate-700/80">
            <h4 className="font-bold text-cyan-300 text-sm mb-1 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-cyan-400" /> 4. 正邪宗門與藏經閣
            </h4>
            <p>
              可選擇拜入名門正派【萬劍正宗】或魔道【九幽魔煞宗】。完成懸賞任務可積累貢獻點，在【藏經閣】無償換取絕品心法、神通秘籍或突破靈物，亦能挑戰宗門大比一路晉升為長老乃至掌門至尊！
            </p>
          </div>

          <div className="bg-[#1b212d] p-3.5 rounded-lg border border-slate-700/80">
            <h4 className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-1.5">
              <Hourglass className="w-4 h-4 text-purple-400" /> 5. 洞府閉關與壽元大限
            </h4>
            <p>
              修仙者壽元有數，每突破一個大境界壽元上限將大幅翻倍。於洞府閉關 1 年、10 年或 100 年可大幅增長修為並完全回滿氣血，但切勿在壽元將盡時閉關百年，否則將含恨坐化、身死道消！
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="py-2 px-8 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            知曉，返回大荒
          </button>
        </div>
      </div>
    </div>
  );
};
