import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Clickable } from '../Clickable';

describe('Clickable', () => {
  it('Should make a DIV clickable with Enter', () => {
    const handleClick = jest.fn();
    render(<Clickable onClick={handleClick}>Clickable</Clickable>);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Should make a DIV clickable with Space', () => {
    const handleClick = jest.fn();
    render(<Clickable onClick={handleClick}>Clickable</Clickable>);

    fireEvent.keyUp(screen.getByRole('button'), { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Should make a DIV still clickable with mouse', () => {
    const handleClick = jest.fn();
    render(<Clickable onClick={handleClick}>Clickable</Clickable>);

    userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Should add role="button" if not using a <button />', () => {
    render(<Clickable as="div">Clickable</Clickable>);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
