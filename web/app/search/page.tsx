'use client';

import { useRouter } from 'next/navigation';
import { SearchPanel, RecordItem } from '@/components/SearchPanel';

export default function SearchPage() {
  const router = useRouter();

  function handleLoad(record: RecordItem) {
    const params = new URLSearchParams({
      yun: String(record.yun),
      mountain: record.mountain,
      shijiao: record.shijiao,
      owner: record.owner,
      address: record.address,
      angle: record.angle,
      firePit: record.firePit ? '1' : '0',
      qiXing: record.qiXing ? '1' : '0',
      notes: record.notes,
      date: record.date,
    });
    router.push(`/?${params}`);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4">
        <h1 className="text-xl font-bold text-amber-700 border-b border-amber-200 pb-2 mb-4">
          查詢堪輿紀錄
        </h1>
        <SearchPanel onLoad={handleLoad} />
      </div>
    </div>
  );
}
