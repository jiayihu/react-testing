export type Institution = {
  bic: string;
  countries: string[];
  id: string;
  logo: string;
  name: string;
  payments: boolean;
  transaction_total_days: string;
};

export type Requisition = {
  id: string;
  status: string;
  agreements: string;
  accounts: string[];
  reference: string;
};

export type UserRequisition = {
  id: string;
  link: string;
};
