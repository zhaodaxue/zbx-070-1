import { getDatabase, generateId, persistDatabase } from '../db/index.js';
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
    minQuantity: row.min_quantity,
    deadline: row.deadline,
    pickupPoint: row.pickup_point as PickupPoint,
    currentQuantity: row.current_quantity,
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
    const db = getDatabase();
    const id = generateId();
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `INSERT INTO groups (id, initiator, fish_type, min_quantity, deadline, pickup_point, current_quantity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'collecting', ?)`
    );
    stmt.run(id, params.initiator, params.fishType, params.minQuantity, params.deadline, params.pickupPoint, now);
    persistDatabase();
    return this.findById(id)!;
  }

  findById(id: string): Group | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
    const result = stmt.getAsObject(id) as GroupRow | undefined;
    return result ? rowToGroup(result) : null;
  }

  findAll(): Group[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM groups ORDER BY created_at DESC');
    const rows = stmt.getAsObject() as unknown as GroupRow[];
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToGroup);
  }

  updateStatus(id: string, status: GroupStatus): void {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE groups SET status = ? WHERE id = ?');
    stmt.run(status, id);
    persistDatabase();
  }

  addQuantity(id: string, delta: number): void {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE groups SET current_quantity = current_quantity + ? WHERE id = ?');
    stmt.run(delta, id);
    persistDatabase();
  }
}

export const groupRepository = new GroupRepository();
