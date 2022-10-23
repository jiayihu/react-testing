export enum RequisitionActionType {
  SAVE_REQUISITION_ACCOUNTS = 'SAVE_REQUISITION_ACCOUNTS',
  SAVE_REQUISITION_ACCOUNTS_SUCCESS = 'SAVE_REQUISITION_ACCOUNTS_SUCCESS',
  SAVE_REQUISITION_ACCOUNTS_ERROR = 'SAVE_REQUISITION_ACCOUNTS_ERROR',
}

export function saveRequisitionAccounts(uid: string) {
  return {
    type: RequisitionActionType.SAVE_REQUISITION_ACCOUNTS,
    payload: { uid },
  } as const;
}

export function saveRequisitionAccountsSuccess() {
  return {
    type: RequisitionActionType.SAVE_REQUISITION_ACCOUNTS_SUCCESS,
  } as const;
}

export function saveRequisitionAccountsError(error: Error) {
  return {
    type: RequisitionActionType.SAVE_REQUISITION_ACCOUNTS_ERROR,
    payload: { error },
  } as const;
}

export type SaveRequisitionAccountsAction = ReturnType<typeof saveRequisitionAccounts>;
export type SaveRequisitionAccountsSuccessAction = ReturnType<
  typeof saveRequisitionAccountsSuccess
>;
export type SaveRequisitionAccountsErrorAction = ReturnType<typeof saveRequisitionAccountsError>;

export type RequisitionAction =
  | SaveRequisitionAccountsAction
  | SaveRequisitionAccountsSuccessAction
  | SaveRequisitionAccountsErrorAction;
