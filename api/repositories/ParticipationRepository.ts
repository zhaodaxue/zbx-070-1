import { getDatabase, generateId, persistDatabase } from '../db/index.js';
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
    quantity: row.quantity,
    createdAt: row.created_at,
  };
}

function rowToUserParticipation(row: UserParticipationRow): UserParticipation {
  return {
    id: row.id,
    groupId: row.group_id,
    nickname: row.nickname,
    quantity: row.quantity,
    createdAt: row.created_at,
    group: {
      id: row.group_id,
      fishType: row.g_fish_type as FishType,
      initiator: row.g_initiator,
      minQuantity: row.g_min_quantity,
      deadline: row.g_deadline,
      pickupPoint: row.g_pickup_point as PickupPoint,
      currentQuantity: row.g_current_quantity,
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
    const db = getDatabase();
    const id = generateId();
    const now = new Date().toISOString();
    const stmt = db.prepare(
      'INSERT INTO participations (id, group_id, nickname, quantity, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, params.groupId, params.nickname, params.quantity, now);
    persistDatabase();
    return this.findById(id)!;
  }

  findById(id: string): Participation | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM participations WHERE id = ?');
    const result = stmt.getAsObject(id) as ParticipationRow | undefined;
    return result ? rowToParticipation(result) : null;
  }

  findByGroupId(groupId: string): Participation[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM participations WHERE group_id = ? ORDER BY created_at ASC');
    const rows = stmt.getAsObject(groupId) as unknown as ParticipationRow[];
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToParticipation);
  }

  existsByGroupAndNickname(groupId: string, nickname: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('SELECT 1 FROM participations WHERE group_id = ? AND nickname = ? LIMIT 1');
    const result = stmt.getAsObject(groupId, nickname);
    return result !== undefined && result !== null;
  }

  findByNickname(nickname: string): UserParticipation[] {
    const db = getDatabase();
    const stmt = db.prepare(
      `SELECT p.*,
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
       ORDER BY p.created_at DESC`
    );
    const rows = stmt.getAsObject(nickname) as unknown as UserParticipationRow[];
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToUserParticipation);
  }
}

export const participationRepository = new ParticipationRepository();
