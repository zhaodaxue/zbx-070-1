import { useState } from 'react';
import { Search, X, Fish, Clock } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import { formatDateTime, getStatusLabel, getStatusClass, cn } from '../lib/utils.js';

export default function Sidebar() {
  const { userNickname, setUserNickname, userRecords, userRecordsLoading, fetchUserRecords, clearUserRecords } =
    useAppStore();
  const [inputValue, setInputValue] = useState(userNickname);

  const handleSearch = () => {
    const n = inputValue.trim();
    if (!n) return;
    setUserNickname(n);
    fetchUserRecords(n);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
          <h3 className="font-title text-lg font-bold text-ocean-800 mb-3 flex items-center gap-2">
            <Search size={18} className="text-coral-500" />
            我的参团记录
          </h3>
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的昵称"
              className="flex-1 px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:border-coral-400 focus:bg-white transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-xl bg-coral-500 text-white text-sm font-semibold hover:bg-coral-600 transition-colors"
            >
              查询
            </button>
          </div>
          {userNickname && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-ocean-600">
                查询：<span className="font-semibold text-ocean-800">{userNickname}</span>
              </span>
              <button
                onClick={() => {
                  clearUserRecords();
                  setInputValue('');
                }}
                className="text-xs text-ocean-400 hover:text-coral-500 flex items-center gap-1"
              >
                <X size={12} />
                清除
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
          <h4 className="font-title font-bold text-ocean-800 mb-3">
            {userNickname ? `共 ${userRecords.length} 条参与` : '尚未查询'}
          </h4>
          {userRecordsLoading ? (
            <div className="text-sm text-ocean-400 py-4 text-center">加载中...</div>
          ) : userRecords.length === 0 ? (
            <div className="text-sm text-ocean-400 py-4 text-center">
              {userNickname ? '暂无参与记录' : '输入昵称查询参团记录'}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {userRecords.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Fish size={14} className="text-coral-500" />
                      <span className="font-semibold text-sm text-ocean-800">{r.group.fishType}</span>
                      <span className="text-xs text-ocean-500">{r.group.initiator}</span>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap',
                        getStatusClass(r.group.status)
                      )}
                    >
                      {getStatusLabel(r.group.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ocean-600">
                    <span>参团 <b className="text-coral-600">{r.quantity}</b> 条</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatDateTime(r.group.deadline)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
