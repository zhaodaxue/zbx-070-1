import { Group, GroupDetail } from '../../shared/types.js';
import { groupRepository } from '../repositories/GroupRepository.js';
import { participationRepository } from '../repositories/ParticipationRepository.js';
import { evaluateGroupStatus } from './judge.js';

function decorateGroup(group: Group): Group {
  const status = evaluateGroupStatus(group);
  if (status !== group.status && group.status === 'collecting') {
    groupRepository.updateStatus(group.id, status);
    return { ...group, status };
  }
  return group;
}

export function listGroups(): Group[] {
  const groups = groupRepository.findAll();
  return groups.map(decorateGroup);
}

export function getGroupDetail(groupId: string): GroupDetail | null {
  const rawGroup = groupRepository.findById(groupId);
  if (!rawGroup) return null;
  const group = decorateGroup(rawGroup);
  const participations = participationRepository.findByGroupId(groupId);
  return { ...group, participations };
}

export interface GroupStats {
  total: number;
  collecting: number;
  success: number;
  failed: number;
}

export function getGroupStats(): GroupStats {
  const groups = listGroups();
  return groups.reduce(
    (acc, g) => {
      acc.total++;
      acc[g.status]++;
      return acc;
    },
    { total: 0, collecting: 0, success: 0, failed: 0 }
  );
}
