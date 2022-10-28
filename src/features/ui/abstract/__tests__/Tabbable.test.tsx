import { render, screen } from '@testing-library/react';
import { Tabbable } from '../Tabbable';

describe('Tabbable', () => {
  it('Should render a tabbable element by default', () => {
    render(<Tabbable>Tabbable</Tabbable>);

    const element = screen.getByText(/Tabbable/i);

    expect(element.getAttribute('tabIndex')).toBeDefined();
  });

  it('Should allow using a different element', () => {
    render(<Tabbable as="span">Tabbable</Tabbable>);

    const element = screen.getByText(/Tabbable/i);

    expect(element.tagName).toBe('SPAN');
    expect(element.getAttribute('tabIndex')).toBeDefined();
  });

  it('Should not put tabIndex for natively tabbable elements', () => {
    render(<Tabbable as="button">Tabbable</Tabbable>);

    const element = screen.getByText(/Tabbable/i);

    expect(element.getAttribute('tabIndex')).toBe(null);
  });

  it('Should set the correct attributes if disabled', () => {
    render(<Tabbable disabled>Tabbable</Tabbable>);

    const element = screen.getByText(/Tabbable/i);

    expect(element.getAttribute('disabled')).toBeDefined();
    expect(element.getAttribute('aria-disabled')).toBeDefined();
  });

  it('Should set only aria-disabled if still focusable', () => {
    render(
      <Tabbable disabled focusable>
        Tabbable
      </Tabbable>,
    );

    const element = screen.getByText(/Tabbable/i);

    expect(element.getAttribute('disabled')).toBe(null);
    expect(element.getAttribute('aria-disabled')).toBeDefined();
  });
});
