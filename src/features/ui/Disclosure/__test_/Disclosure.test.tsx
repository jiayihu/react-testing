import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { omit } from 'lodash';
import { Disclosure } from '../Disclosure';
import { DisclosureContent } from '../DisclosureContent';
import { discosureStateProps, useDisclosureState } from '../useDisclosureState';

describe('Discolosure', () => {
  it('Should render a togglable button', () => {
    const toggle = jest.fn();

    render(
      <Disclosure id="uniqueId" toggle={toggle}>
        Toggle
      </Disclosure>,
    );

    const clickable = screen.getByRole('button', { name: /toggle/i });

    userEvent.click(clickable);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('Should render the proper aria attributes', () => {
    const toggle = jest.fn();
    const id = 'uniqueId';

    const { rerender } = render(
      <Disclosure id={id} toggle={toggle} visible={false}>
        Toggle
      </Disclosure>,
    );

    const clickable = screen.getByRole('button', { name: /toggle/i });
    expect(clickable).toHaveAttribute('aria-controls', id);
    expect(clickable).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <Disclosure id={id} toggle={toggle} visible>
        Toggle
      </Disclosure>,
    );
    expect(clickable).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('DisclosureContent', () => {
  it('Should render a disclosable content', () => {
    const { rerender } = render(
      <DisclosureContent visible={false} animated animating={false}>
        Content
      </DisclosureContent>,
    );

    const contentEl = screen.getByText(/content/i);
    expect(contentEl).not.toBeVisible();

    rerender(
      <DisclosureContent visible animated animating={true}>
        Content
      </DisclosureContent>,
    );
    expect(contentEl).toBeVisible();

    rerender(
      <DisclosureContent visible animated animating={false}>
        Content
      </DisclosureContent>,
    );
    expect(contentEl).toBeVisible();
  });

  it('Should animate the disclosed content', async () => {
    const { rerender } = render(
      <DisclosureContent visible={false} animating={false}>
        Content
      </DisclosureContent>,
    );

    const contentEl = screen.getByText(/content/i);

    rerender(
      <DisclosureContent visible animated animating={true}>
        Content
      </DisclosureContent>,
    );

    await waitFor(() => expect(contentEl).toHaveAttribute('data-enter'));
    expect(contentEl).not.toHaveAttribute('data-leave');

    rerender(
      <DisclosureContent visible animated animating={false}>
        Content
      </DisclosureContent>,
    );

    await waitFor(() => expect(contentEl).toHaveAttribute('data-enter'));
    expect(contentEl).not.toHaveAttribute('data-leave');
  });

  it('Should animate the undisclosed content', async () => {
    const { rerender } = render(
      <DisclosureContent visible animating={false}>
        Content
      </DisclosureContent>,
    );

    const contentEl = screen.getByText(/content/i);

    rerender(
      <DisclosureContent visible={false} animated animating={true}>
        Content
      </DisclosureContent>,
    );

    await waitFor(() => expect(contentEl).toHaveAttribute('data-leave'));
    expect(contentEl).not.toHaveAttribute('data-enter');

    rerender(
      <DisclosureContent visible={false} animated animating={false}>
        Content
      </DisclosureContent>,
    );

    await waitFor(() => expect(contentEl).toHaveAttribute('data-leave'));
    expect(contentEl).not.toHaveAttribute('data-enter');
  });
});

describe('Disclosure', () => {
  const id = 'id';

  it('Should an accessible button based on the Disclosure state', () => {
    const toggle = jest.fn();

    render(<Disclosure visible={false} id={id} toggle={toggle} />);

    const element = screen.getByRole('button');

    expect(element.getAttribute('aria-expanded')).toBe('false');
    expect(element.getAttribute('aria-controls')).toBe(id);
  });

  it('Should toggle when clicked', () => {
    const toggle = jest.fn();

    render(<Disclosure visible={false} id={id} toggle={toggle} />);

    const element = screen.getByRole('button');

    userEvent.click(element);

    expect(toggle).toHaveBeenCalled();
  });
});

describe('useDisclosureState', () => {
  it('Should allow to change the visibility state', () => {
    const { result } = renderHook(() => useDisclosureState());

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.show();
    });

    expect(result.current.visible).toBe(true);
  });

  it('Should allow to toggle the visibility state', () => {
    const { result } = renderHook(() => useDisclosureState());

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.visible).toBe(true);
  });

  it('Should allow to change the visibility state multiple times', () => {
    const { result } = renderHook(() => useDisclosureState());

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.show();
    });

    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.hide();
    });

    expect(result.current.visible).toBe(false);
  });

  it('Should set the state to animated', () => {
    const { result } = renderHook(() => useDisclosureState({ animated: true }));

    act(() => {
      result.current.show();
    });

    expect(result.current.animated).toBe(true);
    expect(result.current.animating).toBe(true);
  });

  it('Should support specifying an animation duration', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useDisclosureState({ animated: 300 }));

    act(() => {
      result.current.show();
    });

    expect(result.current.animating).toBe(true);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.animating).toBe(false);
  });

  it('Should not contain extra properties', () => {
    const { result: disclosureProps } = renderHook(() => useDisclosureState());

    expect(omit(disclosureProps.current, discosureStateProps)).toEqual({});
  });
});

describe('Disclosure + DisclosureContent + useDisclosureState', () => {
  it('Should render an interactive Disclosure', () => {
    function TestComponent() {
      const disclosure = useDisclosureState({});
      return (
        <>
          <Disclosure {...disclosure}>Toggle</Disclosure>
          <DisclosureContent {...disclosure}>Content</DisclosureContent>
        </>
      );
    }

    render(<TestComponent />);

    const element = screen.getByText('Content');

    expect(element).toBeDefined();
  });
});
