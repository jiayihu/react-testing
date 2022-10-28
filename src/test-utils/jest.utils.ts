import { setImmediate } from 'timers';

export function flushPromises(runTimers?: boolean): Promise<void> {
  runTimers && jest.runOnlyPendingTimers();

  // Force the PromiseJobs queue to flush
  return new Promise((resolve) => setImmediate(resolve));
}

export function setupWindowLocation() {
  const originalWindowLocation = window.location;

  // @ts-expect-error
  delete window.location;

  // @ts-expect-error
  window.location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(originalWindowLocation),
      assign: {
        configurable: true,
        value: jest.fn(),
      },
    },
  );

  return () => {
    window.location = originalWindowLocation;
  };
}
