import { useQuery } from '@tanstack/react-query';
import { getBudgets } from './services/budgets.firebase';

export const budgetsQueryKey = 'budgets';

export const useBudgets = (uid: string) => {
  return useQuery([budgetsQueryKey], () => getBudgets(uid));
};
