import type { Group, GroupDetail, UserParticipation } from '@shared/types';

const baseTime = '2026-06-17T10:00:00.000Z';

export const mockGroupCollecting: Group = {
  id: 'group-collecting-1',
  initiator: '老王',
  fishType: '黄鱼',
  minQuantity: 5,
  deadline: '2026-06-17T12:00:00.000Z',
  pickupPoint: '甲',
  currentQuantity: 2,
  status: 'collecting',
  createdAt: '2026-06-17T08:00:00.000Z',
};

export const mockGroupSuccess: Group = {
  id: 'group-success-1',
  initiator: '李婶',
  fishType: '带鱼',
  minQuantity: 3,
  deadline: '2026-06-17T09:00:00.000Z',
  pickupPoint: '乙',
  currentQuantity: 8,
  status: 'success',
  createdAt: '2026-06-17T06:00:00.000Z',
};

export const mockGroupFailed: Group = {
  id: 'group-failed-1',
  initiator: '张叔',
  fishType: '三文鱼',
  minQuantity: 10,
  deadline: '2026-06-17T09:30:00.000Z',
  pickupPoint: '丙',
  currentQuantity: 4,
  status: 'failed',
  createdAt: '2026-06-17T07:00:00.000Z',
};

export const mockGroupDetailCollecting: GroupDetail = {
  ...mockGroupCollecting,
  participations: [
    {
      id: 'p1',
      groupId: 'group-collecting-1',
      nickname: '小明',
      quantity: 2,
      createdAt: '2026-06-17T09:00:00.000Z',
    },
  ],
};

export const mockGroupDetailSuccess: GroupDetail = {
  ...mockGroupSuccess,
  participations: [
    {
      id: 'p-s1',
      groupId: 'group-success-1',
      nickname: '赵六',
      quantity: 3,
      createdAt: '2026-06-17T06:30:00.000Z',
    },
    {
      id: 'p-s2',
      groupId: 'group-success-1',
      nickname: '钱七',
      quantity: 5,
      createdAt: '2026-06-17T07:00:00.000Z',
    },
  ],
};

export const mockGroupDetailFailed: GroupDetail = {
  ...mockGroupFailed,
  participations: [
    {
      id: 'p-f1',
      groupId: 'group-failed-1',
      nickname: '孙八',
      quantity: 4,
      createdAt: '2026-06-17T08:00:00.000Z',
    },
  ],
};

export const mockUserParticipations: UserParticipation[] = [
  {
    id: 'p-u1',
    groupId: 'group-collecting-1',
    nickname: '小明',
    quantity: 2,
    createdAt: '2026-06-17T09:00:00.000Z',
    group: {
      id: 'group-collecting-1',
      fishType: '黄鱼',
      initiator: '老王',
      minQuantity: 5,
      deadline: '2026-06-17T12:00:00.000Z',
      pickupPoint: '甲',
      currentQuantity: 2,
      status: 'collecting',
    },
  },
  {
    id: 'p-u2',
    groupId: 'group-success-1',
    nickname: '小明',
    quantity: 1,
    createdAt: '2026-06-17T06:40:00.000Z',
    group: {
      id: 'group-success-1',
      fishType: '带鱼',
      initiator: '李婶',
      minQuantity: 3,
      deadline: '2026-06-17T09:00:00.000Z',
      pickupPoint: '乙',
      currentQuantity: 8,
      status: 'success',
    },
  },
];

export const mockGroupsList: Group[] = [
  mockGroupCollecting,
  mockGroupSuccess,
  mockGroupFailed,
];

export { baseTime };
