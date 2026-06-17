import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/test/test-utils';
import Sidebar from '@/components/Sidebar';
import { mockUserParticipations } from '@/test/mockData';

function makeFetchMock(responseMap: Record<string, { status: number; body: unknown }>) {
  const mock = vi.fn().mockImplementation((url: string) => {
    const resp = responseMap[url] || { status: 200, body: { success: true, data: [] } };
    return Promise.resolve({
      ok: resp.status < 400,
      status: resp.status,
      json: () => Promise.resolve(resp.body),
    } as Response);
  });
  global.fetch = mock;
  return mock;
}

describe('接龙大厅侧栏 - 初始状态', () => {
  beforeEach(() => {
    makeFetchMock({});
  });

  it('初始态显示「输入昵称查询参团记录」', () => {
    render(<Sidebar />);
    expect(screen.getByText('我的参团记录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入你的昵称')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /查询/ })).toBeInTheDocument();
    expect(screen.getByText(/输入昵称查询参团记录/)).toBeInTheDocument();
  });

  it('尚未查询时不显示参与记录列表', () => {
    render(<Sidebar />);
    expect(screen.queryByText('共')).not.toBeInTheDocument();
    expect(screen.queryByText(/条参与/)).not.toBeInTheDocument();
  });
});

describe('接龙大厅侧栏 - 查询有记录', () => {
  beforeEach(() => {
    makeFetchMock({
      '/api/groups/user/%E5%B0%8F%E6%98%8E/participations': {
        status: 200,
        body: { success: true, data: mockUserParticipations },
      },
    });
  });

  it('输入昵称查询后，记录条数与 mock 数据一致', async () => {
    render(<Sidebar />);

    const input = screen.getByPlaceholderText('输入你的昵称');
    fireEvent.change(input, { target: { value: '小明' } });

    const queryBtn = screen.getByRole('button', { name: /查询/ });
    fireEvent.click(queryBtn);

    await waitFor(() => {
      expect(screen.getByText(/共 2 条参与/)).toBeInTheDocument();
    });
  });

  it('每条记录展示正确的品种名称', async () => {
    render(<Sidebar />);

    const input = screen.getByPlaceholderText('输入你的昵称');
    fireEvent.change(input, { target: { value: '小明' } });
    fireEvent.click(screen.getByRole('button', { name: /查询/ }));

    await waitFor(() => {
      expect(screen.getByText('黄鱼')).toBeInTheDocument();
    });

    expect(screen.getByText('带鱼')).toBeInTheDocument();
  });

  it('每条记录展示正确的状态徽标', async () => {
    render(<Sidebar />);

    const input = screen.getByPlaceholderText('输入你的昵称');
    fireEvent.change(input, { target: { value: '小明' } });
    fireEvent.click(screen.getByRole('button', { name: /查询/ }));

    await waitFor(() => {
      expect(screen.getByText('拼团中')).toBeInTheDocument();
    });

    expect(screen.getByText('已成团')).toBeInTheDocument();
  });

  it('展示查询的昵称名', async () => {
    render(<Sidebar />);

    const input = screen.getByPlaceholderText('输入你的昵称');
    fireEvent.change(input, { target: { value: '小明' } });
    fireEvent.click(screen.getByRole('button', { name: /查询/ }));

    await waitFor(() => {
      expect(screen.getByText('查询：')).toBeInTheDocument();
    });
    expect(screen.getByText('小明')).toBeInTheDocument();
  });
});

describe('接龙大厅侧栏 - 无记录', () => {
  beforeEach(() => {
    makeFetchMock({
      '/api/groups/user/%E9%99%8C%E7%94%9F%E4%BA%BA/participations': {
        status: 200,
        body: { success: true, data: [] },
      },
    });
  });

  it('无记录时显示「暂无参与记录」', async () => {
    render(<Sidebar />);

    const input = screen.getByPlaceholderText('输入你的昵称');
    fireEvent.change(input, { target: { value: '陌生人' } });
    fireEvent.click(screen.getByRole('button', { name: /查询/ }));

    await waitFor(() => {
      expect(screen.getByText('暂无参与记录')).toBeInTheDocument();
    });
  });
});

describe('接龙大厅侧栏 - 清除', () => {
  beforeEach(() => {
    makeFetchMock({
      '/api/groups/user/%E5%B0%8F%E6%98%8E/participations': {
        status: 200,
        body: { success: true, data: mockUserParticipations },
      },
    });
  });

  it('点清除后回到「输入昵称查询参团记录」初始态', async () => {
    render(<Sidebar />);

    const input = screen.getByPlaceholderText('输入你的昵称');
    fireEvent.change(input, { target: { value: '小明' } });
    fireEvent.click(screen.getByRole('button', { name: /查询/ }));

    await waitFor(() => {
      expect(screen.getByText(/共 2 条参与/)).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole('button', { name: /清除/ });
    fireEvent.click(clearBtn);

    expect(screen.getByText(/输入昵称查询参团记录/)).toBeInTheDocument();
    expect(screen.queryByText(/共 .* 条参与/)).not.toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('');
  });
});
