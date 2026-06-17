import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Fish,
  User,
  Clock,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import { useAppStore } from '../store/index.js';
import { GroupDetail as GroupDetailT, Participation, FishType } from '@shared/types.js';
import {
  cn,
  formatDateTime,
  getCountdown,
  getStatusLabel,
  getStatusClass,
} from '../lib/utils.js';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchGroupDetail, joinGroup } = useAppStore();

  const [group, setGroup] = useState<GroupDetailT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nickname, setNickname] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [, setTick] = useState(0);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const g = await fetchGroupDetail(id);
    if (!g) {
      setError('接龙不存在或已被删除');
    } else {
      setGroup(g);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(() => {
      load();
      setTick((x) => x + 1);
    }, 10000);
    return () => clearInterval(t);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !group) return;
    setSubmitting(true);
    setSubmitMsg(null);
    const r = await joinGroup(id, { nickname, quantity });
    setSubmitting(false);
    if (r.success) {
      setSubmitMsg({ type: 'ok', text: '参团成功！🐟' });
      setNickname('');
      setQuantity(1);
      load();
    } else {
      setSubmitMsg({ type: 'err', text: r.error || '参团失败' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-ocean-500">加载中...</div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={() => navigate('/')} className="text-ocean-600 hover:text-coral-500 text-sm mb-4 flex items-center gap-1">
          <ArrowLeft size={14} /> 返回接龙大厅
        </button>
        <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-3" />
          <p className="text-lg text-red-600">{error || '接龙不存在'}</p>
        </div>
      </div>
    );
  }

  const progress = Math.min(100, (group.currentQuantity / group.minQuantity) * 100);
  const countdown = getCountdown(group.deadline);
  const locked = group.status !== 'collecting';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate('/')}
        className="text-ocean-600 hover:text-coral-500 text-sm mb-4 flex items-center gap-1"
      >
        <ArrowLeft size={14} /> 返回接龙大厅
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div
            className={cn(
              'bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden',
              group.status === 'success' && 'ring-2 ring-green-200',
              group.status === 'failed' && 'ring-2 ring-red-200'
            )}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-sm font-semibold">
                  <Fish size={15} />
                  {group.fishType}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
                    group.status === 'collecting'
                      ? 'bg-coral-400 border-coral-300 text-white'
                      : group.status === 'success'
                        ? 'bg-green-400 border-green-300 text-white'
                        : 'bg-red-400 border-red-300 text-white'
                  )}
                >
                  {getStatusLabel(group.status)}
                </span>
                <span className="ml-auto px-3 py-1 rounded-md bg-white/15 text-sm font-bold">
                  {group.pickupPoint}号自提
                </span>
              </div>
              <h2 className="font-title text-2xl font-bold mb-1">
                {group.initiator} 发起的 {group.fishType} 拼团
              </h2>
              <div className="flex items-center gap-4 text-sm text-ocean-100">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  截止：{formatDateTime(group.deadline)}
                </span>
                {!countdown.expired && group.status === 'collecting' && (
                  <span className="text-coral-200 font-semibold">⏳ {countdown.text}</span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-ocean-600 font-medium">拼团进度</span>
                  <span className="text-base font-bold">
                    <span className={cn(group.currentQuantity >= group.minQuantity ? 'text-success' : 'text-ocean-800')}>
                      {group.currentQuantity}
                    </span>
                    <span className="text-ocean-400 mx-1">/</span>
                    <span className="text-ocean-500">{group.minQuantity} 条</span>
                    {group.currentQuantity >= group.minQuantity ? (
                      <span className="ml-2 text-xs text-success font-medium">已达标</span>
                    ) : (
                      <span className="ml-2 text-xs text-coral-500 font-medium">
                        还差 {group.minQuantity - group.currentQuantity} 条
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-3.5 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      group.status === 'success'
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : group.status === 'failed'
                          ? 'bg-gradient-to-r from-red-300 to-red-500'
                          : 'bg-gradient-to-r from-coral-300 to-coral-500 animate-progress-pulse'
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 flex items-center gap-2">
                  <User size={15} className="text-ocean-400" />
                  <span className="text-ocean-500">发起人：</span>
                  <b className="text-ocean-800">{group.initiator}</b>
                </div>
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 flex items-center gap-2">
                  <MapPin size={15} className="text-ocean-400" />
                  <span className="text-ocean-500">自提：</span>
                  <b className="text-ocean-800">{group.pickupPoint}号点</b>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6">
            <h3 className="font-title text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-coral-500" />
              参团名单（{group.participations.length} 人）
            </h3>
            {group.participations.length === 0 ? (
              <div className="text-center py-8 text-ocean-400 text-sm">
                还没有人参团，快来第一个接龙吧！
              </div>
            ) : (
              <ul className="divide-y divide-cream-100">
                {group.participations.map((p: Participation, idx: number) => (
                  <li key={p.id} className="py-3 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-ocean-100 text-ocean-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-ocean-800 flex-1">{p.nickname}</span>
                    <span className="text-sm text-ocean-500">{formatDateTime(p.createdAt)}</span>
                    <span className="px-3 py-1 rounded-lg bg-coral-100 text-coral-700 font-bold text-sm">
                      {p.quantity} 条
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl shadow-card border border-cream-200 p-6">
            <h3 className="font-title text-lg font-bold text-ocean-800 mb-4">
              {locked ? '接龙已结束' : '我要参团'}
            </h3>

            {locked ? (
              <div
                className={cn(
                  'p-4 rounded-xl flex items-start gap-2',
                  group.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                )}
              >
                {group.status === 'success' ? (
                  <>
                    <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-success">已成功成团 🎉</div>
                      <div className="text-xs text-ocean-600 mt-1">
                        共 {group.currentQuantity} 条，记录已锁定，不可修改。
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-danger">很遗憾，流团了</div>
                      <div className="text-xs text-ocean-600 mt-1">
                        最终 {group.currentQuantity} / {group.minQuantity} 条，未达起订量。
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ocean-700 mb-1.5">你的昵称 *</label>
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="请输入昵称（同一昵称仅可参团一次）"
                    maxLength={20}
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 focus:border-coral-400 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ocean-700 mb-1.5">参团条数 *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-11 rounded-xl bg-cream-100 hover:bg-cream-200 text-ocean-700 font-bold text-lg"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="flex-1 px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-center font-bold text-lg focus:border-coral-400 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="w-10 h-11 rounded-xl bg-cream-100 hover:bg-cream-200 text-ocean-700 font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {submitMsg && (
                  <div
                    className={cn(
                      'flex items-start gap-2 p-3 rounded-xl text-sm',
                      submitMsg.type === 'ok'
                        ? 'bg-green-50 border border-green-200 text-success'
                        : 'bg-red-50 border border-red-200 text-danger'
                    )}
                  >
                    {submitMsg.type === 'ok' ? (
                      <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    )}
                    {submitMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !nickname.trim()}
                  className="btn-wave w-full py-3.5 rounded-xl bg-coral-500 text-white font-bold text-lg shadow-md hover:bg-coral-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <Send size={18} />
                  {submitting ? '提交中...' : `🐟 参团（${quantity} 条）`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
