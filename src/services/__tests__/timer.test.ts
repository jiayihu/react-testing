import { setImmediate } from 'timers';
import { wait } from '../../utils';

describe('jest timers', () => {
  async function asyncFn() {
    console.log('Before wait 1');
    await wait(1000);
    console.log('After wait 1');

    console.log('Before wait 2');
    await wait(1000);
    console.log('After wait 2');
  }

  it('Should wait for the timer', async () => {
    jest.useFakeTimers('legacy');

    const request = asyncFn();

    console.log('Run pending timers 1');
    jest.runOnlyPendingTimers();

    await flushPromises();

    console.log('Run pending timers 2');
    jest.runOnlyPendingTimers();

    await request;
  });
});

const flushPromises = () => new Promise(setImmediate);
