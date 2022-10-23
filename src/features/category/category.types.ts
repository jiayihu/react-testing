export enum CategoryName {
  Entertainment = 'Entertainment',
  Family = 'Family',
  General = 'General',
  Grocery = 'Grocery',
  Health = 'Health',
  Insurance = 'Insurance',
  Investment = 'Investment',
  Mortgage = 'Mortgage',
  Gifts = 'Gifts',
  Restaurants = 'Restaurants',
  Salary = 'Salary',
  Services = 'Services',
  Shopping = 'Shopping',
  Trading = 'Trading',
  Transfer = 'Transfer',
  Transport = 'Transport',
  Travel = 'Travel',
  Utility = 'Utility',
}

export type Category = {
  name: CategoryName;
  icon: string;
  color: string;
};

/** Use a Record to ensure all CategoryName values have a value */
export const categoryMap: Record<CategoryName, Category> = {
  [CategoryName.Entertainment]: {
    name: CategoryName.Entertainment,
    icon: 'controller',
    color: '#ff1744',
  },
  [CategoryName.Family]: { name: CategoryName.Family, icon: 'people', color: '#ef5350' },
  [CategoryName.General]: { name: CategoryName.General, icon: 'credit-card', color: '#bdbdbd' },
  [CategoryName.Grocery]: { name: CategoryName.Grocery, icon: 'basket3-fill', color: '#d4e157' },
  [CategoryName.Health]: { name: CategoryName.Health, icon: 'heart-pulse-fill', color: '#26c6da' },
  [CategoryName.Insurance]: {
    name: CategoryName.Insurance,
    icon: 'clipboard-heart-fill',
    color: '#29b6f6',
  },
  [CategoryName.Investment]: {
    name: CategoryName.Investment,
    icon: 'piggy-bank-fill',
    color: '#ffee58',
  },
  [CategoryName.Mortgage]: {
    name: CategoryName.Mortgage,
    icon: 'house-heart-fill',
    color: '#8d6e63',
  },
  [CategoryName.Gifts]: { name: CategoryName.Gifts, icon: 'gift-fill', color: '#ff7043' },
  [CategoryName.Restaurants]: {
    name: CategoryName.Restaurants,
    icon: 'cup-hot-fill',
    color: '#ffa726',
  },
  [CategoryName.Salary]: { name: CategoryName.Salary, icon: 'currency-dollar', color: '#ffca28' },
  [CategoryName.Services]: {
    name: CategoryName.Services,
    icon: 'credit-card-fill',
    color: '#ffe082',
  },
  [CategoryName.Shopping]: { name: CategoryName.Shopping, icon: 'bag-fill', color: '#7e57c2' },
  [CategoryName.Trading]: {
    name: CategoryName.Trading,
    icon: 'currency-bitcoin',
    color: '#78909c',
  },
  [CategoryName.Transfer]: {
    name: CategoryName.Transfer,
    icon: 'arrow-left-right',
    color: '#bbdefb',
  },
  [CategoryName.Transport]: { name: CategoryName.Transport, icon: 'fuel-pump', color: '#3949ab' },
  [CategoryName.Travel]: { name: CategoryName.Travel, icon: 'airplane', color: '#9ccc65' },
  [CategoryName.Utility]: { name: CategoryName.Utility, icon: 'bag-fill', color: '#26a69a' },
};

export const categories = Object.values(categoryMap);
