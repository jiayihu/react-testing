import { faker } from '@faker-js/faker';
import { CategoryName } from '../../../category/category.types';
import { Budget, BudgetPeriod } from '../../budget.types';

export function createBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.product(),
    accountIds: [],
    period: BudgetPeriod.Monthly,
    amount: faker.datatype.number({ min: 1000, max: 10000 }),
    categories: Object.values(CategoryName),
  };
}
