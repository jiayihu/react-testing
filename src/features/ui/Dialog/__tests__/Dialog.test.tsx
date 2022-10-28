import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'theme-ui';
import { Dialog } from '../Dialog';
import { DialogBackdrop } from '../DialogBackdrop';
import { DialogDisclosure } from '../DialogDisclosure';
import { useDialogState } from '../useDialogState';

describe('Dialog', () => {
  it('Should render a disclosable dialog', () => {
    const { rerender } = render(<Dialog id="baseId" visible={false} />);

    const dialog = screen.getByRole('dialog', { hidden: true });

    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toBeVisible();

    rerender(<Dialog id="baseId" visible />);
    expect(dialog).toBeVisible();
  });

  it('Should call hide onKeyDown', () => {
    const hide = jest.fn();

    render(<Dialog id="baseId" visible hide={hide} hideOnEsc />);

    userEvent.keyboard('{esc}');

    expect(hide).toHaveBeenNthCalledWith(1);
  });
});

describe('DialogBackdrop', () => {
  it('Should render a disclosable backdrop', () => {
    const { rerender } = render(<DialogBackdrop visible={false}>Content</DialogBackdrop>);

    const content = screen.getByText(/content/i);
    expect(content).not.toBeVisible();

    rerender(<DialogBackdrop visible>Content</DialogBackdrop>);
    expect(content).toBeVisible();
  });
});

describe('DialogDisclosure', () => {
  it('Should render an interactive DialogDisclosure', () => {
    const toggle = jest.fn();
    render(
      <DialogDisclosure id="baseId" toggle={toggle}>
        Content
      </DialogDisclosure>,
    );

    const button = screen.getByRole('button', { name: /content/i });

    expect(button).toBeInTheDocument();

    userEvent.click(button);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('Should set the correct aria attributes when toggled', () => {
    const toggle = jest.fn();
    const { rerender } = render(
      <DialogDisclosure id="baseId" visible={false} toggle={toggle}>
        Content
      </DialogDisclosure>,
    );

    const button = screen.getByRole('button', { name: /content/i });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <DialogDisclosure id="baseId" visible toggle={toggle}>
        Content
      </DialogDisclosure>,
    );

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('useDialogState', () => {
  it('Should allow to change the visibility state', () => {
    const { result } = renderHook(() => useDialogState({}));

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.show();
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.hide();
    });

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.visible).toBe(false);
  });
});

describe('Dialog + DialogBackdrop + DialogDisclosure + useDisclosureState', () => {
  it('Should render an interactive dialog', () => {
    function Example() {
      const dialog = useDialogState({});
      return (
        <>
          <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
          <DialogBackdrop {...dialog}>
            <Dialog {...dialog} aria-label="Content">
              Content
            </Dialog>
          </DialogBackdrop>
        </>
      );
    }

    render(<Example />);

    const disclosureEl = screen.getByRole('button', { name: /Open dialog/i });
    const contentEl = screen.getByRole('dialog', { hidden: true });

    expect(contentEl).not.toBeVisible();

    userEvent.click(disclosureEl);

    expect(contentEl).toBeVisible();
  });

  it('Should focus the first focusable element in the modal when opened', () => {
    function Example() {
      const dialog = useDialogState({});
      return (
        <>
          <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
          <DialogBackdrop {...dialog}>
            <Dialog {...dialog} aria-label="Content">
              <Button type="button">Focusable</Button>
            </Dialog>
          </DialogBackdrop>
        </>
      );
    }

    render(<Example />);

    const disclosureEl = screen.getByRole('button', { name: /Open dialog/i });
    userEvent.click(disclosureEl);

    const button = screen.getByRole('button', { name: /focusable/i });
    expect(document.activeElement).toEqual(button); // eslint-disable-line testing-library/no-node-access
  });

  it('Should render a Modal which can be closed with ESC', () => {
    function Example() {
      const dialog = useDialogState({});
      return (
        <>
          <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
          <DialogBackdrop {...dialog}>
            <Dialog hideOnEsc {...dialog} aria-label="Content">
              Content
            </Dialog>
          </DialogBackdrop>
        </>
      );
    }

    render(<Example />);

    const disclosureEl = screen.getByRole('button', { name: /Open dialog/i });
    userEvent.click(disclosureEl);

    const contentEl = screen.getByRole('dialog');
    userEvent.keyboard('{esc}');

    expect(contentEl).not.toBeVisible();
  });
});
