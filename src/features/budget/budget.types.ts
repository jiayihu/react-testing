import { CategoryName } from '../category/category.types';

export enum BudgetPeriod {
  Monthly = 'Monthly',
  Weekly = 'Weekly',
}

export type Budget = {
  id: string;
  name: string;
  accountIds: string[];
  period: BudgetPeriod;
  amount: number;
  categories: CategoryName[];
};
