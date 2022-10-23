import { useCallback, useRef } from 'react';
import { Button, Container, Flex, Grid, ThemeUICSSObject } from 'theme-ui';
import theme from '../../theme';
import { Dialog } from './Dialog/Dialog';
import { DialogBackdrop } from './Dialog/DialogBackdrop';
import { DialogInitialState, DialogStateReturn, useDialogState } from './Dialog/useDialogState';

type ConfirmCallbacks = {
  onConfirm: () => void;
  onCancel: () => void;
};

type ConfirmInitialState = DialogInitialState;

type ConfirmReturnState = Omit<DialogStateReturn, 'show'> & {
  show: (callbacks: ConfirmCallbacks) => void;
  confirm: () => void;
};

export const useConfirmDialog = (initialState: ConfirmInitialState): ConfirmReturnState => {
  const dialog = useDialogState(initialState);
  const { show: originalShow, hide: originalHide } = dialog;
  const cancelCallbackRef = useRef<(() => void) | null>(null);
  const confirmCallbackRef = useRef<(() => void) | null>(null);

  const show = useCallback(
    (callbacks: ConfirmCallbacks) => {
      cancelCallbackRef.current = callbacks.onCancel;
      confirmCallbackRef.current = callbacks.onConfirm;

      originalShow();
    },
    [originalShow],
  );

  const hide = useCallback(() => {
    originalHide();
    cancelCallbackRef.current && cancelCallbackRef.current();
  }, [originalHide]);

  const confirm = useCallback(() => {
    confirmCallbackRef.current && confirmCallbackRef.current();
    originalHide();
  }, [originalHide]);

  return {
    ...dialog,
    hide,
    show,
    confirm,
  };
};

type Props = Omit<DialogStateReturn, 'show'> &
  Pick<Partial<ConfirmReturnState>, 'show' | 'hide' | 'confirm'>;

export function Confirmation({ children, confirm, ...dialog }: PropsWithRequiredChildren<Props>) {
  return (
    <DialogBackdrop {...dialog} sx={backdropStyle}>
      <Dialog aria-label="Confirmation" {...dialog} sx={confirmationStyle}>
        <Container>
          <Grid sx={bodyStyle}>
            {children}
            <Flex sx={{ gap: [3] }}>
              <Button type="button" variant="secondary" onClick={dialog.hide}>
                Cancel
              </Button>
              <Button type="button" onClick={confirm}>
                Confirm
              </Button>
            </Flex>
          </Grid>
        </Container>
      </Dialog>
    </DialogBackdrop>
  );
}

const backdropStyle: ThemeUICSSObject = {
  bg: 'rgba(0, 0, 0, 0.1)',
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: theme.zIndices[5],
};

const confirmationStyle: ThemeUICSSObject = {
  top: '50%',
  left: 0,
  overflow: 'auto',
  position: 'absolute',
  transform: 'translateY(-50%)',
  width: '100%',
};

const bodyStyle: ThemeUICSSObject = {
  bg: 'background',
  borderRadius: 'default',
  p: [3],
};
