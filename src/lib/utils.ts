import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GroupStatus } from '@shared/types.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getCountdown(deadlineIso: string): { expired: boolean; text: string } {
  const diff = new Date(deadlineIso).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: '已截止' };
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return { expired: false, text: `剩 ${days}天${hours}时` };
  if (hours > 0) return { expired: false, text: `剩 ${hours}时${minutes}分` };
  return { expired: false, text: `剩 ${minutes}分` };
}

export function getStatusLabel(s: GroupStatus): string {
  switch (s) {
    case 'collecting':
      return '拼团中';
    case 'success':
      return '已成团';
    case 'failed':
      return '已流团';
  }
}

export function getStatusClass(s: GroupStatus): string {
  switch (s) {
    case 'collecting':
      return 'bg-ocean-100 text-ocean-700 border-ocean-200';
    case 'success':
      return 'bg-green-50 text-[#2d5a3d] border-green-200';
    case 'failed':
      return 'bg-red-50 text-[#b33a3a] border-red-200';
  }
}

export function localNowForInput(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function inputValueToIso(v: string): string {
  return new Date(v).toISOString();
}
