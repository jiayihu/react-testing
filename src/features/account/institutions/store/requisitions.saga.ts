import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import { BankAccount } from '../../account.types';
import { addSavedAccount, getInstitutionAccount, getSavedAccounts } from '../../accounts.service';
import { Requisition, UserRequisition } from '../institution.types';
import { getRequisition, getUserRequisitions } from '../institutions.service';
import {
  RequisitionActionType,
  SaveRequisitionAccountsAction,
  saveRequisitionAccountsError,
  saveRequisitionAccountsSuccess,
} from './requisitions.actions';

export function* saveRequisitionAccountsSaga(action: SaveRequisitionAccountsAction) {
  const uid = action.payload.uid;
  const attempts = 5;

  for (let i = 0; i < attempts; i += 1) {
    try {
      const userRequisitions: UserRequisition[] = yield call(getUserRequisitions, uid);

      const requisitionEffects = userRequisitions.map((requisition) =>
        call(getRequisition, requisition.id),
      );
      const requisitions: Requisition[] = yield all(requisitionEffects);

      const getAccountEffects = requisitions.flatMap((requisition) =>
        requisition.accounts.map((accountId) => call(getInstitutionAccount, accountId)),
      );
      const institutionAccounts: BankAccount[] = yield all(getAccountEffects);

      const savedAccounts: BankAccount[] = yield call(getSavedAccounts, uid);
      const savedAccountIds = savedAccounts.map((account) => account.id);

      const saveAccountsEffects = institutionAccounts
        .filter((account) => !savedAccountIds.includes(account.id))
        .map((account) => call(addSavedAccount, uid, account));

      yield all(saveAccountsEffects);

      yield put(saveRequisitionAccountsSuccess());

      return;
    } catch (e) {
      console.log('Attempt #', i, 'failed');
      const isLastAttempt = i < attempts - 1;

      if (isLastAttempt) {
        yield delay(1000);
      } else {
        yield put(saveRequisitionAccountsError(e instanceof Error ? e : new Error(`${e}`)));
      }
    }
  }
}

export function* requisitionsSaga() {
  yield all([
    takeLatest(RequisitionActionType.SAVE_REQUISITION_ACCOUNTS, saveRequisitionAccountsSaga),
  ]);
}
