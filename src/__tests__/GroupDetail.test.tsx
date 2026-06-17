import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@/test/test-utils';
import GroupDetailPage from '@/pages/GroupDetail';
import {
  mockGroupDetailCollecting,
  mockGroupDetailSuccess,
  mockGroupDetailFailed,
} from '@/test/mockData';

function mockFetch(response: { status?: number; body: unknown }, error?: Error) {
  const mock = vi.fn().mockImplementation(() => {
    if (error) {
      return Promise.reject(error);
    }
    return Promise.resolve({
      ok: (response.status ?? 200) < 400,
      status: response.status ?? 200,
      json: () => Promise.resolve(response.body),
    } as Response);
  });
  global.fetch = mock;
  return mock;
}

describe('接龙详情页 - 404 场景', () => {
  beforeEach(() => {
    mockFetch({
      status: 404,
      body: { success: false, error: '接龙不存在' },
    });
  });

  it('访问不存在的 id 时展示「接龙不存在」提示', async () => {
    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/not-exist-id'],
    });

    await waitFor(() => {
      expect(screen.getByText(/接龙不存在/)).toBeInTheDocument();
    });

    expect(screen.queryByText(/拼团进度/)).not.toBeInTheDocument();
    expect(screen.queryByText(/我要参团/)).not.toBeInTheDocument();
  });

  it('404 页面显示返回接龙大厅按钮', async () => {
    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/not-exist-id'],
    });

    await waitFor(() => {
      expect(screen.getByText(/接龙不存在/)).toBeInTheDocument();
    });

    expect(screen.getByText(/返回接龙大厅/)).toBeInTheDocument();
  });
});

describe('接龙详情页 - 状态切换', () => {
  it('collecting 状态显示参团表单，不显示锁定说明', async () => {
    mockFetch({
      status: 200,
      body: { success: true, data: mockGroupDetailCollecting },
    });

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-collecting-1'],
    });

    await waitFor(() => {
      expect(screen.getByText('拼团中')).toBeInTheDocument();
    });

    expect(screen.getByText('我要参团')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/请输入昵称/)).toBeInTheDocument();
    expect(screen.queryByText(/接龙已结束/)).not.toBeInTheDocument();
    expect(screen.queryByText(/已成功成团/)).not.toBeInTheDocument();
  });

  it('success 状态显示接龙已结束 + 已成功成团，不显示参团表单', async () => {
    mockFetch({
      status: 200,
      body: { success: true, data: mockGroupDetailSuccess },
    });

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-success-1'],
    });

    await waitFor(() => {
      expect(screen.getByText('已成团')).toBeInTheDocument();
    });

    expect(screen.getByText('接龙已结束')).toBeInTheDocument();
    expect(screen.getByText(/已成功成团/)).toBeInTheDocument();
    expect(screen.getByText(/记录已锁定/)).toBeInTheDocument();
    expect(screen.queryByText('我要参团')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/请输入昵称/)).not.toBeInTheDocument();
  });

  it('failed 状态显示接龙已结束 + 流团说明，不显示参团表单', async () => {
    mockFetch({
      status: 200,
      body: { success: true, data: mockGroupDetailFailed },
    });

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-failed-1'],
    });

    await waitFor(() => {
      expect(screen.getByText('已流团')).toBeInTheDocument();
    });

    expect(screen.getByText('接龙已结束')).toBeInTheDocument();
    expect(screen.getByText(/很遗憾.*流团/)).toBeInTheDocument();
    expect(screen.queryByText('我要参团')).not.toBeInTheDocument();
  });
});

describe('接龙详情页 - 倒计时', () => {
  it('拼团中显示剩余时间「剩 xx」', async () => {
    mockFetch({
      status: 200,
      body: { success: true, data: mockGroupDetailCollecting },
    });

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-collecting-1'],
    });

    await waitFor(() => {
      expect(screen.getByText('拼团中')).toBeInTheDocument();
    });

    const countdown = screen.getByText(/剩/);
    expect(countdown).toBeInTheDocument();
    expect(countdown.textContent).toContain('剩');
    expect(countdown.textContent).toMatch(/剩 \d+时/);
  });

  it('fake timer 推进至截止后不再显示「剩 xx」', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-17T10:00:00.000Z'));

    mockFetch({
      status: 200,
      body: { success: true, data: mockGroupDetailCollecting },
    });

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-collecting-1'],
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText('拼团中')).toBeInTheDocument();
    expect(screen.getByText(/剩/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3 * 60 * 60 * 1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByText(/剩/)).not.toBeInTheDocument();
  });
});

describe('接龙详情页 - 参团交互', () => {
  it('mock 参团成功后，名单人数与进度数字同步更新', async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                participation: {
                  id: 'new-p',
                  groupId: 'group-collecting-1',
                  nickname: '小红',
                  quantity: 3,
                  createdAt: new Date().toISOString(),
                },
                group: {
                  ...mockGroupDetailCollecting,
                  currentQuantity: 5,
                  participations: [],
                },
              },
            }),
        } as Response);
      }
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: mockGroupDetailCollecting }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              ...mockGroupDetailCollecting,
              currentQuantity: 5,
              participations: [
                ...mockGroupDetailCollecting.participations,
                {
                  id: 'new-p',
                  groupId: 'group-collecting-1',
                  nickname: '小红',
                  quantity: 3,
                  createdAt: new Date().toISOString(),
                },
              ],
            },
          }),
      } as Response);
    });
    global.fetch = fetchMock;

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-collecting-1'],
    });

    await waitFor(() => {
      expect(screen.getByText('拼团中')).toBeInTheDocument();
    });

    expect(screen.getByText(/参团名单.*1 人/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    const nickInput = screen.getByPlaceholderText(/请输入昵称/);
    fireEvent.change(nickInput, { target: { value: '小红' } });

    const submitBtn = screen.getByRole('button', { name: /参团/ });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/参团成功/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/参团名单.*2 人/)).toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('小红')).toBeInTheDocument();
  });

  it('同昵称再次提交时展示后端返回的重复参团错误文案', async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              success: false,
              error: '你已经参与过该接龙了，同一接龙每人只能参团一次',
            }),
        } as Response);
      }
      callCount++;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockGroupDetailCollecting }),
      } as Response);
    });
    global.fetch = fetchMock;

    render(<GroupDetailPage />, {
      routePath: '/group/:id',
      initialEntries: ['/group/group-collecting-1'],
    });

    await waitFor(() => {
      expect(screen.getByText('拼团中')).toBeInTheDocument();
    });

    const nickInput = screen.getByPlaceholderText(/请输入昵称/);
    fireEvent.change(nickInput, { target: { value: '小明' } });

    const submitBtn = screen.getByRole('button', { name: /参团/ });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('你已经参与过该接龙了，同一接龙每人只能参团一次')
      ).toBeInTheDocument();
    });
  });
});
