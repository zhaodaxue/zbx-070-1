import { Group, GroupStatus } from '../../shared/types.js';
import { groupRepository } from '../repositories/GroupRepository.js';
import { participationRepository } from '../repositories/ParticipationRepository.js';

export function isDeadlineReached(group: Pick<Group, 'deadline'>): boolean {
  return Date.now() >= new Date(group.deadline).getTime();
}

export function evaluateGroupStatus(group: Group): GroupStatus {
  if (group.status !== 'collecting') {
    return group.status;
  }
  if (!isDeadlineReached(group)) {
    return 'collecting';
  }
  return group.currentQuantity >= group.minQuantity ? 'success' : 'failed';
}

export function refreshGroupStatusIfNeeded(groupId: string): Group | null {
  const group = groupRepository.findById(groupId);
  if (!group) return null;
  if (group.status !== 'collecting') return group;

  const newStatus = evaluateGroupStatus(group);
  if (newStatus !== group.status) {
    groupRepository.updateStatus(groupId, newStatus);
    return { ...group, status: newStatus };
  }
  return group;
}

export interface JoinResult {
  success: boolean;
  error?: string;
  data?: {
    participation: ReturnType<typeof participationRepository.create>;
    group: Group;
  };
}

export function processJoin(
  groupId: string,
  nickname: string,
  quantity: number
): JoinResult {
  const rawGroup = groupRepository.findById(groupId);
  if (!rawGroup) {
    return { success: false, error: '接龙不存在' };
  }

  const group = refreshGroupStatusIfNeeded(groupId)!;

  if (group.status !== 'collecting') {
    if (isDeadlineReached(group)) {
      return {
        success: false,
        error: group.status === 'success' ? '该接龙已截止且成团，不能再参团' : '该接龙已截止且流团，不能再参团',
      };
    }
    return { success: false, error: '该接龙已锁定，不能再参团' };
  }

  if (isDeadlineReached(group)) {
    groupRepository.updateStatus(groupId, evaluateGroupStatus(group));
    return { success: false, error: '该接龙已截止，不能再参团' };
  }

  if (participationRepository.existsByGroupAndNickname(groupId, nickname)) {
    return { success: false, error: '你已经参与过该接龙了，同一接龙每人只能参团一次' };
  }

  const participation = participationRepository.create({ groupId, nickname, quantity });
  groupRepository.addQuantity(groupId, quantity);

  const updatedGroup = groupRepository.findById(groupId)!;
  refreshGroupStatusIfNeeded(groupId);

  return {
    success: true,
    data: {
      participation,
      group: { ...updatedGroup, status: evaluateGroupStatus(updatedGroup) },
    },
  };
}
