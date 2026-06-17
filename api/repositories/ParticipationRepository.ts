import { queryAll, queryOne, exists, execute, generateId } from '../db/index.js';
import { Participation, UserParticipation, GroupStatus, FishType, PickupPoint } from '../../shared/types.js';

interface ParticipationRow {
  id: string;
  group_id: string;
  nickname: string;
  quantity: number;
  created_at: string;
}

interface UserParticipationRow extends ParticipationRow {
  g_initiator: string;
  g_fish_type: string;
  g_min_quantity: number;
  g_deadline: string;
  g_pickup_point: string;
  g_current_quantity: number;
  g_status: string;
}

function rowToParticipation(row: ParticipationRow): Participation {
  return {
    id: row.id,
    groupId: row.group_id,
    nickname: row.nickname,
    quantity: Number(row.quantity),
    createdAt: row.created_at,
  };
}

function rowToUserParticipation(row: UserParticipationRow): UserParticipation {
  return {
    id: row.id,
    groupId: row.group_id,
    nickname: row.nickname,
    quantity: Number(row.quantity),
    createdAt: row.created_at,
    group: {
      id: row.group_id,
      fishType: row.g_fish_type as FishType,
      initiator: row.g_initiator,
      minQuantity: Number(row.g_min_quantity),
      deadline: row.g_deadline,
      pickupPoint: row.g_pickup_point as PickupPoint,
      currentQuantity: Number(row.g_current_quantity),
      status: row.g_status as GroupStatus,
    },
  };
}

export class ParticipationRepository {
  create(params: {
    groupId: string;
    nickname: string;
    quantity: number;
  }): Participation {
    const id = generateId();
    const now = new Date().toISOString();
    execute(
      'INSERT INTO participations (id, group_id, nickname, quantity, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, params.groupId, params.nickname, params.quantity, now]
    );
    const p = this.findById(id);
    if (!p) throw new Error('Failed to create participation');
    return p;
  }

  findById(id: string): Participation | null {
    const row = queryOne<ParticipationRow>('SELECT * FROM participations WHERE id = ?', [id]);
    return row ? rowToParticipation(row) : null;
  }

  findByGroupId(groupId: string): Participation[] {
    const rows = queryAll<ParticipationRow>(
      'SELECT * FROM participations WHERE group_id = ? ORDER BY created_at ASC',
      [groupId]
    );
    return rows.map(rowToParticipation);
  }

  existsByGroupAndNickname(groupId: string, nickname: string): boolean {
    return exists(
      'SELECT 1 FROM participations WHERE group_id = ? AND nickname = ? LIMIT 1',
      [groupId, nickname]
    );
  }

  findByNickname(nickname: string): UserParticipation[] {
    const rows = queryAll<UserParticipationRow>(
      `SELECT p.id, p.group_id, p.nickname, p.quantity, p.created_at,
              g.initiator AS g_initiator,
              g.fish_type AS g_fish_type,
              g.min_quantity AS g_min_quantity,
              g.deadline AS g_deadline,
              g.pickup_point AS g_pickup_point,
              g.current_quantity AS g_current_quantity,
              g.status AS g_status
       FROM participations p
       INNER JOIN groups g ON g.id = p.group_id
       WHERE p.nickname = ?
       ORDER BY p.created_at DESC`,
      [nickname]
    );
    return rows.map(rowToUserParticipation);
  }
}

export const participationRepository = new ParticipationRepository();
