'use client';

import { StarChartResult, PALACE_LABELS, PALACE_DIRECTION, YUN_LABELS } from '@/lib/sanyuan';

interface StarChartProps {
  result: StarChartResult;
  isCurrent?: boolean;
}

export function StarChart({ result, isCurrent }: StarChartProps) {
  const yunLabel = YUN_LABELS[result.yun - 1];

  return (
    <div className={`flex flex-col items-center ${isCurrent ? 'scale-105 shadow-xl' : 'opacity-90'}`}>
      <div
        className={`text-center font-bold text-lg mb-2 px-4 py-1 rounded-full ${
          isCurrent
            ? 'bg-amber-500 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {yunLabel}
      </div>

      <div className="grid grid-cols-3 border-2 border-gray-700 rounded-sm overflow-hidden">
        {result.cells.map((cell, i) => (
          <div
            key={i}
            className={`
              relative w-24 h-24 border border-gray-400 flex flex-col items-center justify-center p-1
              ${cell.isFire ? 'bg-red-100' : i === 4 ? 'bg-yellow-50' : 'bg-white'}
            `}
          >
            {/* 火坑標記 */}
            {cell.isFire && (
              <span className="absolute top-0.5 left-0.5 text-xs text-red-600">🔥</span>
            )}

            {/* 宮位名稱 */}
            <span className="absolute top-0.5 right-1 text-[10px] text-gray-400 leading-none">
              {PALACE_LABELS[cell.palace]}
            </span>

            {/* 山星（紅）+ 向星（藍）一排 */}
            <div className="flex w-full justify-between px-1 mb-0.5">
              <span className="text-red-600 font-bold text-lg leading-none">{cell.mountStar}</span>
              <span className="text-blue-600 font-bold text-lg leading-none">{cell.facingStar}</span>
            </div>

            {/* 元旦盤（黑，大） */}
            <span className="text-gray-900 font-bold text-3xl leading-none">{cell.periodStar}</span>

            {/* 方向 */}
            <span className="absolute bottom-0.5 left-0 right-0 text-center text-[10px] text-gray-400 leading-none">
              {PALACE_DIRECTION[cell.palace]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
