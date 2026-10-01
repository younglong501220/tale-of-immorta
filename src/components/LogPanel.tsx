import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types/game';
import { ScrollText, Trash2 } from 'lucide-react';

interface Props {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogPanel: React.FC<Props> = ({ logs, onClearLogs }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <footer className="h-44 shrink-0 bg-[#0c0e14] border-t border-[#252c3b] flex flex-col shadow-2xl">
      {/* Log Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#12161f] border-b border-[#1f2635] text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <ScrollText className="w-3.5 h-3.5 text-amber-400" />
          大荒修仙編年紀要 ({logs.length})
        </span>

        <button
          onClick={onClearLogs}
          title="清空歷史記錄"
          className="text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> 清空日誌
        </button>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 select-text">
        {logs.map((log) => {
          let colorClass = 'text-slate-300';
          if (log.colorType === 'gold') colorClass = 'text-amber-300 font-semibold';
          else if (log.colorType === 'red') colorClass = 'text-rose-400 font-bold';
          else if (log.colorType === 'cyan') colorClass = 'text-cyan-300';
          else if (log.colorType === 'purple') colorClass = 'text-purple-300';

          return (
            <div key={log.id} className="leading-relaxed flex items-start gap-2">
              <span className="text-slate-500 shrink-0 text-[11px]">
                [大荒{log.age}年]
              </span>
              <span className={colorClass}>{log.text}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </footer>
  );
};
