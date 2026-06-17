import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Fish, Hash, Clock, MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import { FISH_TYPES, PICKUP_POINTS, FishType } from '@shared/types.js';
import { cn, localNowForInput, inputValueToIso } from '../lib/utils.js';

export default function CreateGroup() {
  const navigate = useNavigate();
  const { createGroup } = useAppStore();

  const [initiator, setInitiator] = useState('');
  const [fishType, setFishType] = useState<FishType>(FISH_TYPES[0]);
  const [minQuantity, setMinQuantity] = useState<number>(5);
  const [deadline, setDeadline] = useState(localNowForInput());
  const [pickupPoint, setPickupPoint] = useState<(typeof PICKUP_POINTS)[number]>('甲');

  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setSubmitting(true);
    const result = await createGroup({
      initiator,
      fishType,
      minQuantity,
      deadline: inputValueToIso(deadline),
      pickupPoint,
    });
    setSubmitting(false);
    if (result.success && result.data) {
      setSuccess(true);
      setTimeout(() => navigate(`/group/${result.data!.id}`), 800);
    } else {
      setErrMsg(result.error || '创建失败，请重试');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-title text-2xl font-bold text-ocean-800">发起新接龙</h1>
        <p className="text-sm text-ocean-500 mt-1">填写拼鱼团的基本信息，邀请邻居们一起拼！</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 sm:p-8 space-y-5"
      >
        <Field label="发起人昵称" icon={<User size={16} />} required>
          <input
            value={initiator}
            onChange={(e) => setInitiator(e.target.value)}
            placeholder="输入你的昵称"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 focus:border-coral-400 focus:bg-white transition-colors"
          />
        </Field>

        <Field label="品种标签" icon={<Fish size={16} />} required>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {FISH_TYPES.map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFishType(f)}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-sm font-medium border transition-all',
                  fishType === f
                    ? 'bg-coral-500 text-white border-coral-500 shadow-md scale-[1.02]'
                    : 'bg-cream-50 text-ocean-700 border-cream-200 hover:border-coral-300 hover:bg-coral-50'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="起订条数" icon={<Hash size={16} />} required hint="至少 3 条">
            <input
              type="number"
              min={3}
              max={999}
              value={minQuantity}
              onChange={(e) => setMinQuantity(Math.max(3, Number(e.target.value) || 3))}
              className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 focus:border-coral-400 focus:bg-white transition-colors"
            />
          </Field>

          <Field label="自提点代号" icon={<MapPin size={16} />} required>
            <div className="grid grid-cols-3 gap-2">
              {PICKUP_POINTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPickupPoint(p)}
                  className={cn(
                    'py-3 rounded-xl text-lg font-bold border transition-all',
                    pickupPoint === p
                      ? 'bg-ocean-600 text-white border-ocean-600 shadow-md'
                      : 'bg-cream-50 text-ocean-700 border-cream-200 hover:border-ocean-400'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="截止时刻" icon={<Clock size={16} />} required hint="截止后自动判定成团/流团">
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 focus:border-coral-400 focus:bg-white transition-colors"
          />
        </Field>

        {errMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {errMsg}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-success">
            <CheckCircle size={18} />
            创建成功，正在跳转到参团页...
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || success}
          className="btn-wave w-full py-3.5 rounded-xl bg-coral-500 text-white font-bold text-lg shadow-md hover:bg-coral-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          <Send size={18} />
          {submitting ? '发布中...' : '🐟 发布接龙'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  required,
  hint,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-ocean-700 mb-2">
        {icon && <span className="text-coral-500">{icon}</span>}
        {label}
        {required && <span className="text-coral-500">*</span>}
        {hint && <span className="text-xs text-ocean-400 font-normal ml-auto">（{hint}）</span>}
      </label>
      {children}
    </div>
  );
}
