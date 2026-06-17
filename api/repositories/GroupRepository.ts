import { queryAll, queryOne, execute, generateId } from '../db/index.js';
import { Group, GroupStatus, FishType, PickupPoint } from '../../shared/types.js';

interface GroupRow {
  id: string;
  initiator: string;
  fish_type: string;
  min_quantity: number;
  deadline: string;
  pickup_point: string;
  current_quantity: number;
  status: string;
  created_at: string;
}

function rowToGroup(row: GroupRow): Group {
  return {
    id: row.id,
    initiator: row.initiator,
    fishType: row.fish_type as FishType,
    minQuantity: Number(row.min_quantity),
    deadline: row.deadline,
    pickupPoint: row.pickup_point as PickupPoint,
    currentQuantity: Number(row.current_quantity),
    status: row.status as GroupStatus,
    createdAt: row.created_at,
  };
}

export class GroupRepository {
  create(params: {
    initiator: string;
    fishType: FishType;
    minQuantity: number;
    deadline: string;
    pickupPoint: PickupPoint;
  }): Group {
    const id = generateId();
    const now = new Date().toISOString();
    execute(
      `INSERT INTO groups (id, initiator, fish_type, min_quantity, deadline, pickup_point, current_quantity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'collecting', ?)`,
      [id, params.initiator, params.fishType, params.minQuantity, params.deadline, params.pickupPoint, now]
    );
    const g = this.findById(id);
    if (!g) throw new Error('Failed to create group');
    return g;
  }

  findById(id: string): Group | null {
    const row = queryOne<GroupRow>('SELECT * FROM groups WHERE id = ?', [id]);
    return row ? rowToGroup(row) : null;
  }

  findAll(): Group[] {
    const rows = queryAll<GroupRow>('SELECT * FROM groups ORDER BY created_at DESC');
    return rows.map(rowToGroup);
  }

  updateStatus(id: string, status: GroupStatus): void {
    execute('UPDATE groups SET status = ? WHERE id = ?', [status, id]);
  }

  addQuantity(id: string, delta: number): void {
    execute('UPDATE groups SET current_quantity = current_quantity + ? WHERE id = ?', [delta, id]);
  }
}

export const groupRepository = new GroupRepository();
