import { useEffect } from 'react';
import { Flex, IconButton, ThemeUICSSObject } from 'theme-ui';
import theme from '../../theme';
import { usePrevious } from '../misc/usePrevious';
import { Dialog, DialogOptions } from './Dialog/Dialog';
import { DialogBackdrop } from './Dialog/DialogBackdrop';
import { Icons } from './Icons';

type ZIndexLevel = 'base' | 'nested';

type Props = DialogOptions & {
  level: ZIndexLevel;
  onClose?: () => void;
};

const zIndexByLevel: Record<ZIndexLevel, number> = {
  base: theme.zIndices[3],
  nested: theme.zIndices[4],
};

export function Modal({ level, children, onClose, ...dialog }: PropsWithRequiredChildren<Props>) {
  const previousVisible = usePrevious(dialog.visible);

  useEffect(() => {
    if (onClose && previousVisible && !dialog.visible) {
      onClose();
    }
  }, [onClose, previousVisible, dialog.visible]);

  return (
    <DialogBackdrop {...dialog} sx={{ ...backdropStyle, zIndex: zIndexByLevel[level] }}>
      <Dialog hideOnEsc {...dialog} sx={modalStyle}>
        <Flex sx={closeStyle}>
          <IconButton onClick={dialog.hide}>
            <Icons name="x" />
          </IconButton>
        </Flex>
        {children}
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
};

const modalStyle: ThemeUICSSObject = {
  bg: 'white',
  borderTopLeftRadius: 'default',
  borderTopRightRadius: 'default',
  bottom: 0,
  height: '90vh',
  left: 0,
  overflow: 'auto',
  position: 'absolute',
  width: '100%',

  transition: 'opacity 250ms ease-in-out, transform 250ms ease-in-out',
  opacity: 0,
  transform: 'translateY(100%)',

  '&[data-enter]': {
    opacity: 1,
    transform: 'translateY(0)',
  },
};

const closeStyle: ThemeUICSSObject = {
  justifyContent: 'flex-end',
};
