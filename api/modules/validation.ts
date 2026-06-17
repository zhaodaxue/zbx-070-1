import { FISH_TYPES, PICKUP_POINTS, FishType, PickupPoint, CreateGroupRequest } from '../../shared/types.js';
import { groupRepository } from '../repositories/GroupRepository.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    initiator: string;
    fishType: FishType;
    minQuantity: number;
    deadline: string;
    pickupPoint: PickupPoint;
  };
}

export function validateCreateGroup(payload: CreateGroupRequest): ValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: '请求体格式错误' };
  }

  const initiator = typeof payload.initiator === 'string' ? payload.initiator.trim() : '';
  if (!initiator) {
    return { valid: false, error: '发起人昵称不能为空' };
  }
  if (initiator.length > 20) {
    return { valid: false, error: '发起人昵称不能超过20个字符' };
  }

  const fishType = payload.fishType;
  if (!FISH_TYPES.includes(fishType as FishType)) {
    return { valid: false, error: `品种必须是以下之一：${FISH_TYPES.join('、')}` };
  }

  const minQuantity = Number(payload.minQuantity);
  if (!Number.isInteger(minQuantity) || minQuantity < 3) {
    return { valid: false, error: '起订条数必须是不小于3的整数' };
  }
  if (minQuantity > 999) {
    return { valid: false, error: '起订条数不能超过999' };
  }

  const deadlineStr = payload.deadline;
  if (!deadlineStr || typeof deadlineStr !== 'string') {
    return { valid: false, error: '截止时刻不能为空' };
  }
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) {
    return { valid: false, error: '截止时刻格式无效' };
  }
  if (deadline.getTime() <= Date.now() + 60 * 1000) {
    return { valid: false, error: '截止时刻必须至少为1分钟之后' };
  }

  const pickupPoint = payload.pickupPoint;
  if (!PICKUP_POINTS.includes(pickupPoint as PickupPoint)) {
    return { valid: false, error: `自提点必须是甲、乙、丙之一` };
  }

  return {
    valid: true,
    data: {
      initiator,
      fishType: fishType as FishType,
      minQuantity,
      deadline: deadline.toISOString(),
      pickupPoint: pickupPoint as PickupPoint,
    },
  };
}

export interface JoinValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    nickname: string;
    quantity: number;
  };
}

export function validateJoinGroup(payload: { nickname?: string; quantity?: number }): JoinValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: '请求体格式错误' };
  }

  const nickname = typeof payload.nickname === 'string' ? payload.nickname.trim() : '';
  if (!nickname) {
    return { valid: false, error: '昵称不能为空' };
  }
  if (nickname.length > 20) {
    return { valid: false, error: '昵称不能超过20个字符' };
  }

  const quantity = Number(payload.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { valid: false, error: '参团条数必须是正整数' };
  }
  if (quantity > 99) {
    return { valid: false, error: '参团条数不能超过99' };
  }

  return {
    valid: true,
    data: { nickname, quantity },
  };
}

export function createValidatedGroup(validated: NonNullable<ValidationResult['data']>) {
  return groupRepository.create(validated);
}
