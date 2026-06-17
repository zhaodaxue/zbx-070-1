import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { getCountdown, getStatusLabel, getStatusClass, formatDateTime } from '@/lib/utils';

describe('utils - getCountdown', () => {
  const baseTime = new Date('2026-06-17T10:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
  });

  it('截止前返回剩余文案（天 + 小时）', () => {
    const deadline = new Date('2026-06-19T14:30:00.000Z').toISOString();
    const result = getCountdown(deadline);
    expect(result.expired).toBe(false);
    expect(result.text).toContain('2天');
    expect(result.text).toContain('4时');
  });

  it('截止前返回剩余文案（小时 + 分钟）', () => {
    const deadline = new Date('2026-06-17T12:05:00.000Z').toISOString();
    const result = getCountdown(deadline);
    expect(result.expired).toBe(false);
    expect(result.text).toContain('2时');
    expect(result.text).toContain('5分');
  });

  it('截止前返回剩余文案（仅分钟）', () => {
    const deadline = new Date('2026-06-17T10:30:00.000Z').toISOString();
    const result = getCountdown(deadline);
    expect(result.expired).toBe(false);
    expect(result.text).toBe('剩 30分');
  });

  it('刚到截止时刻返回已截止', () => {
    const deadline = new Date('2026-06-17T10:00:00.000Z').toISOString();
    const result = getCountdown(deadline);
    expect(result.expired).toBe(true);
    expect(result.text).toBe('已截止');
  });

  it('已过截止时刻返回已截止', () => {
    const deadline = new Date('2026-06-17T08:00:00.000Z').toISOString();
    const result = getCountdown(deadline);
    expect(result.expired).toBe(true);
    expect(result.text).toBe('已截止');
  });

  it('fake timer 推进至截止后返回已截止', () => {
    const deadline = new Date('2026-06-17T10:15:00.000Z').toISOString();
    expect(getCountdown(deadline).expired).toBe(false);
    expect(getCountdown(deadline).text).toContain('剩');

    vi.advanceTimersByTime(16 * 60 * 1000);

    const result = getCountdown(deadline);
    expect(result.expired).toBe(true);
    expect(result.text).toBe('已截止');
  });
});

describe('utils - getStatusLabel', () => {
  it('collecting 返回拼团中', () => {
    expect(getStatusLabel('collecting')).toBe('拼团中');
  });
  it('success 返回已成团', () => {
    expect(getStatusLabel('success')).toBe('已成团');
  });
  it('failed 返回已流团', () => {
    expect(getStatusLabel('failed')).toBe('已流团');
  });
});

describe('utils - getStatusClass', () => {
  it('collecting 返回 ocean 色系类名', () => {
    expect(getStatusClass('collecting')).toContain('ocean');
  });
  it('success 返回 green 色系类名', () => {
    expect(getStatusClass('success')).toContain('green');
  });
  it('failed 返回 red 色系类名', () => {
    expect(getStatusClass('failed')).toContain('red');
  });
});

describe('utils - formatDateTime', () => {
  it('格式化为 YYYY-MM-DD HH:mm', () => {
    const iso = new Date('2026-06-17T10:05:30.000Z').toISOString();
    const result = formatDateTime(iso);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
  });
});
