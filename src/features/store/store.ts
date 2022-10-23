import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import {
  requisitionsReducer,
  RequisitionsState,
} from '../account/institutions/store/requisitions.reducer';
import { requisitionsSaga } from '../account/institutions/store/requisitions.saga';
import { transactionsReducer, TransactionsState } from '../transactions/store/transactions.reducer';
import { transactionsSaga } from '../transactions/store/transactions.saga';

export type RootState = {
  requisitions: RequisitionsState;
  transactions: TransactionsState;
};

const rootReducer = combineReducers<RootState>({
  requisitions: requisitionsReducer,
  transactions: transactionsReducer,
});

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(sagaMiddleware)));

function* rootSaga() {
  yield all([requisitionsSaga(), transactionsSaga()]);
}

sagaMiddleware.run(rootSaga);
