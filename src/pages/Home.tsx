import { useEffect } from 'react';
import { useAppStore } from '../store/index.js';
import GroupCard from '../components/GroupCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { Waves, RefreshCw } from 'lucide-react';

export default function Home() {
  const { groups, loading, error, fetchGroups } = useAppStore();

  useEffect(() => {
    fetchGroups();
    const t = setInterval(fetchGroups, 15000);
    return () => clearInterval(t);
  }, [fetchGroups]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-title text-2xl font-bold text-ocean-800 flex items-center gap-2">
                <Waves size={24} className="text-ocean-500" />
                接龙大厅
              </h1>
              <p className="text-sm text-ocean-500 mt-1">共 {groups.length} 条接龙进行中</p>
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

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && groups.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-white animate-pulse border border-cream-200" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center">
              <div className="text-5xl mb-3">🐟</div>
              <h3 className="font-title text-xl font-bold text-ocean-700 mb-2">还没有接龙</h3>
              <p className="text-sm text-ocean-500">点击右上角「发起接龙」开启第一团吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </main>

        <Sidebar />
      </div>
    </div>
  );
}
