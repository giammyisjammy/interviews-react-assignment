import { useCallback, useState, type ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';

import { ToastContext } from './ToastContext';
import { ToastContainer, ToastContainerProps } from './ToastContainer';

type CloseToastHandler = ToastContainerProps['onClose'];
type Props = {
  children?: ReactNode;
  autoHideDuration: number;
};
export type { Props as ToastProviderProps };

const CloseAction = ({ onClick }: Pick<IconButtonProps, 'onClick'>) => (
  <IconButton size="small" aria-label="close" color="inherit" onClick={onClick}>
    <CloseIcon fontSize="small" />
  </IconButton>
);

export function ToastProvider({ children, autoHideDuration }: Props) {
  const [toastProps, setToastProps] = useState<ToastContainerProps | null>(
    null
  );

  const hideToast: CloseToastHandler = (_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setToastProps(null);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast: useCallback(
          (props) => {
            const handleClose: CloseToastHandler =
              props.onClose !== undefined
                ? (event, reason) => {
                    props.onClose!(event, reason);
                    hideToast(event, reason);
                  }
                : hideToast;

            setToastProps({
              autoHideDuration,
              action: <CloseAction onClick={handleClose} />,
              open: true,
              ...props,
              onClose: handleClose,
            });
          },
          [autoHideDuration]
        ),
      }}
    >
      {children}
      {toastProps && <ToastContainer {...toastProps} />}
    </ToastContext.Provider>
  );
}
// asd
