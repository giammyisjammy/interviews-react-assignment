import Alert, { type AlertProps } from '@mui/material/Alert';
import Snackbar, {
  type SnackbarCloseReason,
  type SnackbarProps,
} from '@mui/material/Snackbar';

export type ToastContainerProps = Omit<SnackbarProps, 'onClose'> & {
  severity?: AlertProps['severity'];
  onClose?: (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => void;
};
export function ToastContainer({
  severity = 'info',
  onClose,
  message,
  ...snackbarProps
}: ToastContainerProps) {
  return (
    <Snackbar onClose={onClose} {...snackbarProps}>
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
