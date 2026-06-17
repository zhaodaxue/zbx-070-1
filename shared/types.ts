export type GroupStatus = 'collecting' | 'success' | 'failed';

export const FISH_TYPES = [
  '带鱼', '黄鱼', '鲳鱼', '鲈鱼', '鲫鱼',
  '鲤鱼', '草鱼', '黑鱼', '多宝鱼', '石斑鱼',
  '三文鱼', '金枪鱼', '秋刀鱼', '鲅鱼', '鳗鱼'
] as const;

export type FishType = typeof FISH_TYPES[number];

export const PICKUP_POINTS = ['甲', '乙', '丙'] as const;
export type PickupPoint = typeof PICKUP_POINTS[number];

export interface Group {
  id: string;
  initiator: string;
  fishType: FishType;
  minQuantity: number;
  deadline: string;
  pickupPoint: PickupPoint;
  currentQuantity: number;
  status: GroupStatus;
  createdAt: string;
}

export interface Participation {
  id: string;
  groupId: string;
  nickname: string;
  quantity: number;
  createdAt: string;
}

export interface GroupDetail extends Group {
  participations: Participation[];
}

export interface UserParticipation extends Participation {
  group: {
    id: string;
    fishType: FishType;
    initiator: string;
    minQuantity: number;
    deadline: string;
    pickupPoint: PickupPoint;
    currentQuantity: number;
    status: GroupStatus;
  };
}

export interface CreateGroupRequest {
  initiator: string;
  fishType: string;
  minQuantity: number;
  deadline: string;
  pickupPoint: string;
}

export interface JoinGroupRequest {
  nickname: string;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
