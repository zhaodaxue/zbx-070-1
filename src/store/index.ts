import { create } from 'zustand';
import { Group, GroupDetail, UserParticipation } from '@shared/types.js';
import { api } from '../api/client.js';

interface AppState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  userNickname: string;
  userRecords: UserParticipation[];
  userRecordsLoading: boolean;

  fetchGroups: () => Promise<void>;
  fetchGroupDetail: (id: string) => Promise<GroupDetail | null>;
  createGroup: (data: {
    initiator: string;
    fishType: string;
    minQuantity: number;
    deadline: string;
    pickupPoint: string;
  }) => Promise<{ success: boolean; error?: string; data?: Group }>;
  joinGroup: (
    id: string,
    data: { nickname: string; quantity: number }
  ) => Promise<{ success: boolean; error?: string }>;
  setUserNickname: (n: string) => void;
  fetchUserRecords: (nickname: string) => Promise<void>;
  clearUserRecords: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  groups: [],
  loading: false,
  error: null,
  userNickname: '',
  userRecords: [],
  userRecordsLoading: false,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    const res = await api.listGroups();
    if (res.success && res.data) {
      set({ groups: res.data, loading: false });
    } else {
      set({ error: res.error || '加载失败', loading: false });
    }
  },

  fetchGroupDetail: async (id: string) => {
    const res = await api.getGroupDetail(id);
    if (res.success && res.data) return res.data;
    return null;
  },

  createGroup: async (data) => {
    const res = await api.createGroup(data);
    if (res.success && res.data) {
      get().fetchGroups();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error };
  },

  joinGroup: async (id, data) => {
    const res = await api.joinGroup(id, data);
    if (res.success) {
      get().fetchGroups();
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  setUserNickname: (n) => set({ userNickname: n }),

  fetchUserRecords: async (nickname) => {
    set({ userRecordsLoading: true });
    const res = await api.getUserParticipations(nickname);
    if (res.success && res.data) {
      set({ userRecords: res.data, userRecordsLoading: false });
    } else {
      set({ userRecords: [], userRecordsLoading: false });
    }
  },

  clearUserRecords: () => set({ userRecords: [], userNickname: '' }),
}));
