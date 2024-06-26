import { createContext } from 'react';

import type { ToastContainerProps } from './ToastContainer.tsx';

export const ToastContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showToast(_props: ToastContainerProps): void {
    throw new Error(
      'showToast not implemented, this means you did not wrap your application in a ToastProvider'
    );
  },
});
