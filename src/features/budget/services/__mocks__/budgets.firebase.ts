import { range } from 'lodash';
import { Budget } from '../../budget.types';
import { createBudget } from '../mocks/budgets.fixtures';

export const getBudgets = jest.fn((uid: string): Promise<Budget[]> => {
  return Promise.resolve(range(0, 2).map(() => createBudget()));
});

export const addBudget = jest.fn((uid: string, budget: Budget): Promise<void> => {
  return Promise.resolve();
});

export const updateBudget = jest.fn(
  (uid: string, budgetId: string, budget: Partial<Budget>): Promise<void> => {
    return Promise.resolve();
  },
);

export const deleteBudget = jest.fn((uid: string, budgetId: string): Promise<void> => {
  return Promise.resolve();
});
