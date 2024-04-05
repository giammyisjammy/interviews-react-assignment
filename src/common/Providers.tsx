import { SWRConfig } from 'swr';

import fetcher from '../helpers/fetcher.ts';
import { ToastProvider } from '../Toast/ToastProvider.tsx';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <SWRConfig value={{ fetcher }}>
      <ToastProvider autoHideDuration={6000}>{children}</ToastProvider>
    </SWRConfig>
  );
}
