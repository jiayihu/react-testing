import * as React from 'react';
import { getFirstTabbableIn } from '../../../../utils/reakit';
import { DialogOptions } from '../Dialog';

export function useFocusOnShow(dialogRef: React.RefObject<HTMLElement>, options: DialogOptions) {
  const shouldFocus = options.visible;
  const animating = !!(options.animated && options.animating);

  React.useEffect(() => {
    const dialog = dialogRef.current;

    if (!shouldFocus || !dialog || animating) {
      return;
    }

    const tabbable = getFirstTabbableIn(dialog, true);

    tabbable ? tabbable.focus() : dialog.focus();
  }, [dialogRef, shouldFocus, animating]);
}
