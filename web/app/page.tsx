'use client';

import { useState } from 'react';
import { ChartForm, FormValues } from '@/components/ChartForm';
import { StarChart } from '@/components/StarChart';
import { StarChartResult, YUN_LABELS } from '@/lib/sanyuan';

export default function HomePage() {
  const [charts, setCharts] = useState<StarChartResult[]>([]);
  const [currentForm, setCurrentForm] = useState<FormValues | null>(null);

  function handleResults(results: StarChartResult[], form: FormValues) {
    setCharts(results);
    setCurrentForm(form);
  }

  return (
    <div className="space-y-6">
      <ChartForm onResults={handleResults} />

      {charts.length === 3 && currentForm && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-amber-800">挨星排盤結果</h2>
            <span className="text-sm text-gray-500">
              {currentForm.mountain} ／ {currentForm.shijiao}
              {currentForm.owner ? ` ／ ${currentForm.owner}` : ''}
            </span>
          </div>

          {/* 圖例說明 */}
          <div className="flex gap-4 text-xs text-gray-500 bg-white rounded-lg px-4 py-2 shadow-sm">
            <span><span className="text-red-600 font-bold">左上</span> = 山星</span>
            <span><span className="text-gray-900 font-bold">中央</span> = 元旦盤（期星）</span>
            <span><span className="text-blue-600 font-bold">右上</span> = 向星</span>
            <span><span className="text-amber-600 font-bold">■</span> = 當運</span>
          </div>

          {/* 三個星盤 */}
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center overflow-x-auto pb-2">
            {charts.map((chart, i) => (
              <div key={chart.yun} className="flex flex-col items-center">
                <StarChart result={chart} isCurrent={i === 1} />
                <p className="mt-2 text-xs text-gray-400">
                  {i === 0 ? '前運' : i === 1 ? '當運' : '後運'}
                  （{YUN_LABELS[chart.yun - 1]}）
                </p>
              </div>
            ))}
          </div>

          {/* 附加資訊卡 */}
          {(currentForm.owner || currentForm.address || currentForm.notes) && (
            <div className="bg-white rounded-xl shadow p-4 text-sm space-y-1 border-l-4 border-amber-400">
              {currentForm.owner && <p><span className="text-gray-500">屋主：</span>{currentForm.owner}</p>}
              {currentForm.address && <p><span className="text-gray-500">地址：</span>{currentForm.address}</p>}
              {currentForm.angle && <p><span className="text-gray-500">角度：</span>{currentForm.angle}°</p>}
              {currentForm.date && <p><span className="text-gray-500">日期：</span>{currentForm.date}</p>}
              {currentForm.notes && <p><span className="text-gray-500">備註：</span><em>{currentForm.notes}</em></p>}
            </div>
          )}
        </div>
      )}

      {charts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">☯</p>
          <p className="text-lg">請填寫上方表單並點擊「排盤」</p>
          <p className="text-sm mt-1">將顯示前運、當運、後運三個飛星盤</p>
        </div>
      )}
    </div>
  );
}
