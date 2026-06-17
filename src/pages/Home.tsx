import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/index.js';
import GroupCard from '../components/GroupCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { Waves, RefreshCw, Filter, X, ArrowUpDown, MapPin, Fish } from 'lucide-react';
import { FISH_TYPES, PICKUP_POINTS, type GroupStatus } from '@shared/types.js';
import { cn } from '../lib/utils.js';

type SortMode = 'deadline' | 'gap';

const STATUS_OPTIONS: { value: GroupStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'collecting', label: '拼团中' },
  { value: 'success', label: '已成团' },
  { value: 'failed', label: '已流团' },
];

export default function Home() {
  const { groups, loading, error, fetchGroups } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState<GroupStatus | ''>(
    () => (searchParams.get('status') as GroupStatus) || ''
  );
  const [fishFilter, setFishFilter] = useState(() => searchParams.get('fish') || '');
  const [pickupFilter, setPickupFilter] = useState(() => searchParams.get('pickup') || '');
  const [sortMode, setSortMode] = useState<SortMode>(
    () => (searchParams.get('sort') as SortMode) || 'deadline'
  );
  const [locateTip, setLocateTip] = useState('');

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
    const t = setInterval(fetchGroups, 15000);
    return () => clearInterval(t);
  }, [fetchGroups]);

  const syncURL = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v) next.set(k, v);
          else next.delete(k);
        });
        return next;
      });
    },
    [setSearchParams]
  );

  const handleStatusChange = (v: GroupStatus | '') => {
    setStatusFilter(v);
    syncURL({ status: v });
  };
  const handleFishChange = (v: string) => {
    setFishFilter(v);
    syncURL({ fish: v });
  };
  const handlePickupChange = (v: string) => {
    setPickupFilter(v);
    syncURL({ pickup: v });
  };
  const handleSortChange = (m: SortMode) => {
    setSortMode(m);
    syncURL({ sort: m });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setFishFilter('');
    setPickupFilter('');
    setSearchParams({});
  };

  const hasFilter = statusFilter || fishFilter || pickupFilter;

  const filtered = useMemo(() => {
    let list = groups;
    if (statusFilter) list = list.filter((g) => g.status === statusFilter);
    if (fishFilter) list = list.filter((g) => g.fishType === fishFilter);
    if (pickupFilter) list = list.filter((g) => g.pickupPoint === pickupFilter);

    return [...list].sort((a, b) => {
      if (sortMode === 'deadline') {
        if (a.status === 'collecting' && b.status !== 'collecting') return -1;
        if (a.status !== 'collecting' && b.status === 'collecting') return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      const gapA = Math.max(0, a.minQuantity - a.currentQuantity);
      const gapB = Math.max(0, b.minQuantity - b.currentQuantity);
      const metA = a.currentQuantity >= a.minQuantity;
      const metB = b.currentQuantity >= b.minQuantity;
      if (metA !== metB) return metA ? 1 : -1;
      return gapB - gapA;
    });
  }, [groups, statusFilter, fishFilter, pickupFilter, sortMode]);

  const collectingCount = groups.filter((g) => g.status === 'collecting').length;
  const endedCount = groups.filter((g) => g.status !== 'collecting').length;

  const handleLocateGroup = useCallback(
    (groupId: string) => {
      const inView = filtered.some((g) => g.id === groupId);
      const doScroll = () => {
        setLocateTip('');
        setTimeout(() => {
          const el = document.getElementById(`group-card-${groupId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-coral-400', 'transition-all');
            setTimeout(() => el.classList.remove('ring-4', 'ring-coral-400'), 2000);
          }
        }, 80);
      };

      if (inView) {
        doScroll();
      } else {
        setStatusFilter('');
        setFishFilter('');
        setPickupFilter('');
        setSearchParams({});
        setLocateTip('已临时清除筛选以定位你的参团记录');
        setTimeout(() => {
          doScroll();
          setTimeout(() => setLocateTip(''), 3000);
        }, 100);
      }
    },
    [filtered, setSearchParams]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-1 min-w-0" ref={mainRef}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-title text-2xl font-bold text-ocean-800 flex items-center gap-2">
                <Waves size={24} className="text-ocean-500" />
                接龙大厅
              </h1>
            </div>
            <button
              onClick={() => fetchGroups()}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-white border border-cream-200 text-ocean-600 text-sm hover:bg-cream-50 disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>

          <div className="text-sm text-ocean-600 mb-3 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              拼团中 <b className="text-coral-600">{collectingCount}</b>
            </span>
            <span>
              已结束 <b className="text-ocean-700">{endedCount}</b>
            </span>
            <span>
              当前显示 <b className="text-ocean-800">{filtered.length}</b>
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-ocean-500" />
              <span className="text-sm font-semibold text-ocean-700">筛选与排序</span>
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1"
                >
                  <X size={12} />
                  清空筛选
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value as GroupStatus | '')}
                className="px-3 py-1.5 rounded-lg border border-cream-300 bg-cream-50 text-sm text-ocean-700 focus:border-ocean-400 focus:bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={fishFilter}
                onChange={(e) => handleFishChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-cream-300 bg-cream-50 text-sm text-ocean-700 focus:border-ocean-400 focus:bg-white max-w-[140px]"
              >
                <option value="">全部品种</option>
                {FISH_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={pickupFilter}
                onChange={(e) => handlePickupChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-cream-300 bg-cream-50 text-sm text-ocean-700 focus:border-ocean-400 focus:bg-white"
              >
                <option value="">全部自提点</option>
                {PICKUP_POINTS.map((p) => (
                  <option key={p} value={p}>
                    {p}号自提点
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 ml-auto">
                <ArrowUpDown size={14} className="text-ocean-400" />
                <button
                  onClick={() => handleSortChange('deadline')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    sortMode === 'deadline'
                      ? 'bg-ocean-100 text-ocean-800 border border-ocean-200'
                      : 'text-ocean-500 hover:text-ocean-700'
                  )}
                >
                  临近截止
                </button>
                <button
                  onClick={() => handleSortChange('gap')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    sortMode === 'gap'
                      ? 'bg-coral-100 text-coral-700 border border-coral-200'
                      : 'text-ocean-500 hover:text-ocean-700'
                  )}
                >
                  差条数优先
                </button>
              </div>
            </div>
          </div>

          {locateTip && (
            <div className="mb-4 p-3 rounded-xl bg-ocean-50 border border-ocean-200 text-sm text-ocean-700 flex items-center gap-2">
              <Fish size={14} className="text-ocean-500" />
              {locateTip}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          {loading && groups.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-white animate-pulse border border-cream-200" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center">
              <div className="text-5xl mb-3">�</div>
              <h3 className="font-title text-xl font-bold text-ocean-700 mb-2">没有符合条件的接龙</h3>
              <p className="text-sm text-ocean-500 mb-4">试试调整筛选条件查看更多接龙</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-ocean-500 text-white text-sm font-semibold hover:bg-ocean-600 transition-colors"
              >
                清空筛选
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </main>

        <Sidebar onLocateGroup={handleLocateGroup} />
      </div>
    </div>
  );
}
