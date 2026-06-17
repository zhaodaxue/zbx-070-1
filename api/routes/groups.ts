import { Router, Request, Response } from 'express';
import { validateCreateGroup, validateJoinGroup, createValidatedGroup } from '../modules/validation.js';
import { processJoin } from '../modules/judge.js';
import { listGroups, getGroupDetail } from '../modules/aggregator.js';
import { participationRepository } from '../repositories/ParticipationRepository.js';
import { ApiResponse } from '../../shared/types.js';

const router = Router();

router.get('/user/:nickname/participations', (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const nickname = decodeURIComponent(req.params.nickname).trim();
    if (!nickname) {
      return res.status(400).json({ success: false, error: '昵称不能为空' });
    }
    const list = participationRepository.findByNickname(nickname);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('[API] /user/:nickname/participations error:', err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.get('/', (_req: Request, res: Response<ApiResponse<ReturnType<typeof listGroups>>>) => {
  try {
    const groups = listGroups();
    res.json({ success: true, data: groups });
  } catch (err) {
    console.error('[API] GET /api/groups error:', err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.post('/', (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const validation = validateCreateGroup(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    const group = createValidatedGroup(validation.data);
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    console.error('[API] POST /api/groups error:', err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.get('/:id', (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const detail = getGroupDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ success: false, error: '接龙不存在' });
    }
    res.json({ success: true, data: detail });
  } catch (err) {
    console.error('[API] GET /api/groups/:id error:', err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.post('/:id/join', (req: Request, res: Response<ApiResponse<unknown>>) => {
  try {
    const validation = validateJoinGroup(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    const result = processJoin(req.params.id, validation.data.nickname, validation.data.quantity);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API] POST /api/groups/:id/join error:', err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

export default router;
