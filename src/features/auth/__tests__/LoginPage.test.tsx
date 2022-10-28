import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import {
  createUser,
  signInUser,
  signInWithGithub,
  signInWithGoogle,
} from '../services/auth.firebase';

jest.mock('../services/auth.firebase');

describe('LoginPage', () => {
  it('should display inputs and buttons to login and register', () => {
    render(<LoginPage />);

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should display buttons to login with external providers', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gitHub/i })).toBeInTheDocument();
  });

  it('should sign in the user', async () => {
    render(<LoginPage />);

    const email = screen.getByRole('textbox', { name: /email/i });
    userEvent.type(email, 'example@email.com');

    const password = screen.getByLabelText(/password/i);
    userEvent.type(password, 'password');

    const submit = screen.getByRole('button', { name: /sign in/i });

    userEvent.click(submit);

    await waitFor(() => expect(signInUser).toHaveBeenCalledTimes(1));

    expect(signInUser).toHaveBeenCalledWith('example@email.com', 'password');
  });

  it('should register the user', async () => {
    render(<LoginPage />);

    const email = screen.getByRole('textbox', { name: /email/i });
    userEvent.type(email, 'example@email.com');

    const password = screen.getByLabelText(/password/i);
    userEvent.type(password, 'password');

    const submit = screen.getByRole('button', { name: /register/i });

    userEvent.click(submit);

    await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1));

    expect(createUser).toHaveBeenCalledWith('example@email.com', 'password');
  });

  it('should sign in with Google', () => {
    render(<LoginPage />);

    const google = screen.getByRole('button', { name: /google/i });
    userEvent.click(google);

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('should sign in with GitHub', () => {
    render(<LoginPage />);

    const github = screen.getByRole('button', { name: /github/i });
    userEvent.click(github);

    expect(signInWithGithub).toHaveBeenCalledTimes(1);
  });
});
