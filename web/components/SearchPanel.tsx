'use client';

import { useState } from 'react';
import { YUN_LABELS } from '@/lib/sanyuan';

export interface RecordItem {
  id: string;
  date: string;
  owner: string;
  address: string;
  angle: string;
  yun: number;
  mountain: string;
  shijiao: string;
  firePit: boolean;
  qiXing: boolean;
  notes: string;
  createdAt: string;
}

interface GroupedRecords {
  yun: number;
  label: string;
  items: RecordItem[];
}

interface SearchPanelProps {
  onLoad?: (record: RecordItem) => void;
}

export function SearchPanel({ onLoad }: SearchPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [groups, setGroups] = useState<GroupedRecords[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ action: 'list', q: keyword });
      const res = await fetch(`/api/records?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '查詢失敗');

      const records: RecordItem[] = data.records || [];
      const grouped: Record<number, RecordItem[]> = {};
      for (const r of records) {
        if (!grouped[r.yun]) grouped[r.yun] = [];
        grouped[r.yun].push(r);
      }
      const result: GroupedRecords[] = Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([yun, items]) => ({
          yun: Number(yun),
          label: YUN_LABELS[Number(yun) - 1],
          items,
        }));
      setGroups(result);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查詢失敗');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除這筆紀錄？')) return;
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();
      if (data.success) {
        setGroups(prev =>
          prev
            .map(g => ({ ...g, items: g.items.filter(r => r.id !== id) }))
            .filter(g => g.items.length > 0)
        );
      }
    } catch {
      alert('刪除失敗');
    }
  }

  const totalCount = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="輸入屋主姓名或地址關鍵字..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? '搜尋中...' : '搜尋'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {searched && (
        <div className="text-sm text-gray-500">
          共找到 {totalCount} 筆紀錄
          {keyword && <span>（關鍵字：「{keyword}」）</span>}
        </div>
      )}

      {groups.length === 0 && searched && !loading && (
        <p className="text-gray-400 text-sm text-center py-8">查無符合紀錄</p>
      )}

      {groups.map(group => (
        <div key={group.yun} className="border border-amber-200 rounded-xl overflow-hidden">
          <div className="bg-amber-50 px-4 py-2 font-semibold text-amber-800 border-b border-amber-200">
            {group.label}（{group.items.length} 筆）
          </div>
          <div className="divide-y divide-gray-100">
            {group.items.map(item => (
              <div key={item.id} className="px-4 py-3 flex items-start justify-between hover:bg-gray-50">
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{item.owner || '（無屋主）'}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                    {item.firePit && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">火坑</span>}
                    {item.qiXing && <span className="text-xs bg-amber-100 text-amber-600 px-1 rounded">起星</span>}
                  </div>
                  <div className="text-sm text-gray-600 truncate">{item.address || '（無地址）'}</div>
                  <div className="text-xs text-gray-400">
                    {item.mountain} ／ {item.shijiao}
                    {item.angle ? ` ／ ${item.angle}°` : ''}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-gray-500 italic truncate">「{item.notes}」</div>
                  )}
                </div>
                <div className="flex gap-2 ml-3 shrink-0">
                  {onLoad && (
                    <button
                      onClick={() => onLoad(item)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded transition-colors"
                    >
                      載入
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1 rounded transition-colors"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
