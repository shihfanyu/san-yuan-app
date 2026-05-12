'use client';

import { useState } from 'react';
import {
  MOUNTAINS,
  YUN_LABELS,
  SHIJIAO_OPTIONS,
  ShijiaoType,
  getThreeCharts,
  StarChartResult,
} from '@/lib/sanyuan';

export interface FormValues {
  date: string;
  yun: number;
  mountain: string;
  shijiao: ShijiaoType;
  owner: string;
  address: string;
  angle: string;
  firePit: boolean;
  qiXing: boolean;
  notes: string;
}

interface ChartFormProps {
  onResults: (charts: StarChartResult[], form: FormValues) => void;
}

const defaultForm: FormValues = {
  date: new Date().toISOString().split('T')[0],
  yun: 9,
  mountain: '子山',
  shijiao: '背坎向離',
  owner: '',
  address: '',
  angle: '',
  firePit: false,
  qiXing: false,
  notes: '',
};

export function ChartForm({ onResults }: ChartFormProps) {
  const [form, setForm] = useState<FormValues>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const charts = getThreeCharts(
      form.yun,
      form.mountain,
      form.shijiao,
      form.firePit,
      form.qiXing
    );
    onResults(charts, form);
  }

  async function handleSave() {
    if (!form.owner && !form.address) {
      setSaveMsg('請至少填寫屋主或地址');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', ...form }),
      });
      const data = await res.json();
      setSaveMsg(data.success ? '儲存成功！' : `儲存失敗：${data.error}`);
    } catch {
      setSaveMsg('網路錯誤，儲存失敗');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 space-y-4">
      <h2 className="text-xl font-bold text-amber-700 border-b border-amber-200 pb-2">
        三元玄空挨星排盤
      </h2>

      {/* 第一列：日期 + 運 + 山 + 視角 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">日期</span>
          <input
            type="date"
            value={form.date}
            onChange={e => update('date', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">運</span>
          <select
            value={form.yun}
            onChange={e => update('yun', Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {YUN_LABELS.map((label, i) => (
              <option key={i} value={i + 1}>{label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">山（坐山）</span>
          <select
            value={form.mountain}
            onChange={e => update('mountain', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {MOUNTAINS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">視角</span>
          <select
            value={form.shijiao}
            onChange={e => update('shijiao', e.target.value as ShijiaoType)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {SHIJIAO_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 第二列：屋主 + 地址 + 角度 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">屋主</span>
          <input
            type="text"
            placeholder="屋主姓名"
            value={form.owner}
            onChange={e => update('owner', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">地址</span>
          <input
            type="text"
            placeholder="房屋地址"
            value={form.address}
            onChange={e => update('address', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">角度（0-360°）</span>
          <input
            type="number"
            placeholder="羅盤角度"
            min="0"
            max="360"
            step="0.1"
            value={form.angle}
            onChange={e => update('angle', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      {/* 第三列：火坑 + 起星 */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.firePit}
            onChange={e => update('firePit', e.target.checked)}
            className="w-4 h-4 accent-red-500"
          />
          <span className="text-sm font-medium text-red-700">🔥 火坑</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.qiXing}
            onChange={e => update('qiXing', e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm font-medium text-amber-700">⭐ 起星（替星法）</span>
        </label>
      </div>

      {/* 第四列：堪輿註解 */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600">堪輿註解</span>
        <input
          type="text"
          placeholder="補充說明、勘查備註..."
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </label>

      {/* 按鈕列 */}
      <div className="flex gap-3 items-center pt-1">
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          排盤
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {saving ? '儲存中...' : '儲存至 Google Sheets'}
        </button>
        {saveMsg && (
          <span className={`text-sm ${saveMsg.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {saveMsg}
          </span>
        )}
      </div>
    </form>
  );
}
