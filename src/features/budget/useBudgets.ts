import { useQuery } from '@tanstack/react-query';
import { getBudgets } from './budgets.service';

export const budgetsQueryKey = 'budgets';

export const useBudgets = (uid: string) => {
  return useQuery([budgetsQueryKey], () => getBudgets(uid));
};
