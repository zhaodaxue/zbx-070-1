import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Fish } from 'lucide-react';
import { Group } from '@shared/types.js';
import { formatDateTime, getCountdown, getStatusLabel, getStatusClass, cn } from '../lib/utils.js';

interface Props {
  group: Group;
}

export default function GroupCard({ group }: Props) {
  const navigate = useNavigate();
  const progress = Math.min(100, (group.currentQuantity / group.minQuantity) * 100);
  const countdown = getCountdown(group.deadline);

  return (
    <div
      className={cn(
        'card-hover bg-white rounded-2xl shadow-card hover:shadow-cardHover overflow-hidden border border-cream-200',
        group.status === 'success' && 'ring-2 ring-green-200',
        group.status === 'failed' && 'ring-2 ring-red-200 opacity-85'
      )}
    >
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-sm font-semibold border border-coral-200">
            <Fish size={15} />
            {group.fishType}
          </span>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
              getStatusClass(group.status)
            )}
          >
            {getStatusLabel(group.status)}
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-cream-200 text-ocean-700 text-sm font-bold font-title">
          {group.pickupPoint}号自提
        </span>
      </div>

      <div className="px-5 pb-4 space-y-2.5">
        <div className="flex items-center gap-2 text-sm text-ocean-700">
          <User size={15} className="text-ocean-400 flex-shrink-0" />
          <span>发起人：</span>
          <span className="font-semibold text-ocean-800">{group.initiator}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-ocean-700">
          <Clock size={15} className="text-ocean-400 flex-shrink-0" />
          <span>截止：</span>
          <span className="font-medium text-ocean-800">{formatDateTime(group.deadline)}</span>
          {!countdown.expired && group.status === 'collecting' && (
            <span className="ml-auto text-coral-500 font-bold text-xs">{countdown.text}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-ocean-700">
          <MapPin size={15} className="text-ocean-400 flex-shrink-0" />
          <span>自提点：</span>
          <span className="font-semibold text-ocean-800">{group.pickupPoint}</span>
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-ocean-600">拼团进度</span>
          <span className="text-sm font-bold">
            <span className={cn(group.currentQuantity >= group.minQuantity ? 'text-success' : 'text-ocean-800')}>
              {group.currentQuantity}
            </span>
            <span className="text-ocean-400 mx-1">/</span>
            <span className="text-ocean-500">{group.minQuantity}</span>
            <span className="text-ocean-500 ml-1">条</span>
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-cream-200 overflow-hidden">
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

      <div className="px-5 pb-5">
        <button
          onClick={() => navigate(`/group/${group.id}`)}
          className={cn(
            'btn-wave w-full py-2.5 rounded-xl font-semibold text-white transition-all',
            group.status === 'collecting'
              ? 'bg-coral-500 hover:bg-coral-600 shadow-md hover:shadow-lg'
              : group.status === 'success'
                ? 'bg-success hover:brightness-110'
                : 'bg-ocean-600 hover:bg-ocean-700'
          )}
        >
          {group.status === 'collecting' ? '🐟 立即参团' : group.status === 'success' ? '✅ 查看详情' : '查看详情'}
        </button>
      </div>
    </div>
  );
}
