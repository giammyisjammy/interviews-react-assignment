import { useContext } from 'react';

import { ToastContext } from './ToastContext.tsx';

export function useToast() {
  return useContext(ToastContext);
}
