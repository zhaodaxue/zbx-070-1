import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route, createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

interface WrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  routePath?: string;
}

function AllTheProviders({ children, initialEntries = ['/'], routePath }: WrapperProps) {
  if (routePath) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={routePath} element={children} />
        </Routes>
      </MemoryRouter>
    );
  }
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[]; routePath?: string }
) {
  const { initialEntries, routePath, ...restOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries} routePath={routePath}>
        {children}
      </AllTheProviders>
    ),
    ...restOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };
