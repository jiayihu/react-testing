export const createUser = jest.fn((email: string, password: string) => {
  return Promise.resolve();
});

export const signInUser = jest.fn((email: string, password: string) => {
  return Promise.resolve();
});

export const signOutUser = jest.fn(() => {
  return Promise.resolve();
});

export const signInWithGoogle = jest.fn(() => {
  return Promise.resolve();
});

export const signInWithGithub = jest.fn(() => {
  return Promise.resolve();
});
