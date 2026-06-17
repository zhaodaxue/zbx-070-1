import {
  Group,
  GroupDetail,
  UserParticipation,
  CreateGroupRequest,
  JoinGroupRequest,
  ApiResponse,
} from '@shared/types.js';

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '网络请求失败' };
  }
}

export const api = {
  listGroups: () => request<Group[]>('/api/groups', { method: 'GET' }),

  createGroup: (data: CreateGroupRequest) =>
    request<Group>('/api/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGroupDetail: (id: string) => request<GroupDetail>(`/api/groups/${id}`, { method: 'GET' }),

  joinGroup: (id: string, data: JoinGroupRequest) =>
    request<{ participation: unknown; group: Group }>(`/api/groups/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUserParticipations: (nickname: string) =>
    request<UserParticipation[]>(`/api/groups/user/${encodeURIComponent(nickname)}/participations`, {
      method: 'GET',
    }),
};
