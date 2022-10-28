import { wait } from '../../../../../utils';
import { createBankAccount } from '../../../services/mocks/accounts.fixtures';
import {
  createRequisition,
  createUserRequisition,
} from '../../services/mocks/institutionts.fixtures';
import { saveRequisitionAccounts } from '../requisitions.actions';
import { saveRequisitionAccountsSaga } from '../requisitions.saga';

describe('saveRequisitionAccountsSaga', () => {
  it('Should allow us to run an async saga', async () => {
    jest.useFakeTimers();

    function* mySaga() {
      const _result: number = yield wait(1000); // eslint-disable-line testing-library/await-async-utils
    }

    const iter = mySaga() as Generator;

    const promise: Promise<void> = iter.next().value;

    jest.runOnlyPendingTimers();

    return promise.then(() => {
      const result = iter.next(1);

      expect(result.done).toBe(true);
    });
  });

  it('Complete the saga with success', () => {
    const iter = saveRequisitionAccountsSaga(saveRequisitionAccounts('uid')) as Generator;

    iter.next(); // Start

    iter.next([createUserRequisition()]); // getUserRequisitions

    iter.next([createRequisition()]); // getRequisitions

    const institutionAccounts = [createBankAccount(), createBankAccount()];
    iter.next(institutionAccounts); // institutionAccounts

    iter.next(institutionAccounts.slice(0, 1)); // savedAccounts

    iter.next(); // saveAccounts

    const result = iter.next(); // saveRequisitionAccountsSuccess

    expect(result.done).toBe(true);
  });
});
