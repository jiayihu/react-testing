import { formatISO } from 'date-fns';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { BankAccount } from '../../account/account.types';
import { getSavedAccount, updateSavedAccount } from '../../account/services/accounts.firebase';
import { addAccountTransactions, getAccountTransactions } from '../services/transactions.firebase';
import { getInstitutionAccountTransactions } from '../services/transactions.nordigen';
import { Transaction } from '../transaction.types';
import {
  RequestAccountTransactionsAction,
  requestAccountTransactionsError,
  saveAccountTransactions,
  TransactionActionType,
} from './transactions.actions';

/**
 * - Get account lastUpdate
 *
 * - Retrieve last transactions from Firestore
 *
 * - Retrieve all bank transactions after lastUpdate
 * - Save them in Firestore
 * - Update lastUpdate
 *
 * - Update last transactions from Firestore
 */
function* requestTransactions(action: RequestAccountTransactionsAction) {
  const { uid, accountId, config } = action.payload;

  const account: BankAccount = yield call(getSavedAccount, uid, accountId);

  const { lastUpdate } = account;

  function* fetchSavedTransactions() {
    const savedTransactions: Transaction[] = yield call(getAccountTransactions, uid, account.id);
    yield put(saveAccountTransactions(account, savedTransactions));

    return savedTransactions;
  }

  function* checkNewTransactions() {
    const newTransactions: Transaction[] = yield call(getInstitutionAccountTransactions, account, {
      dateFrom: lastUpdate ? new Date(lastUpdate) : undefined,
    });

    return newTransactions;
  }

  try {
    if (config.skipUpdate) {
      yield call(fetchSavedTransactions);
    } else {
      const result: [Transaction[], Transaction[]] = yield all([
        fetchSavedTransactions(),
        checkNewTransactions(),
      ]);
      const [savedTransactions, newTransactions] = result;
      const unsaveTransactions = newTransactions.filter(
        (newT) =>
          savedTransactions.find((savedT) => savedT.transactionId === newT.transactionId) ===
          undefined,
      );

      yield call(addAccountTransactions, uid, account.id, unsaveTransactions);
      yield call(updateSavedAccount, uid, account.id, {
        lastUpdate: formatISO(new Date()),
      });

      yield put(saveAccountTransactions(account, unsaveTransactions));
    }
  } catch (e) {
    yield put(requestAccountTransactionsError(e instanceof Error ? e : new Error(`${e}`)));
  }
}

export function* transactionsSaga() {
  yield all([takeEvery(TransactionActionType.REQUEST_TRANSACTIONS, requestTransactions)]);
}
