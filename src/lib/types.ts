export type View = "dashboard" | "add" | "people" | "settings";

export type Category =
  | "Food"
  | "Fuel"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Other";

export type PayeeType = "me" | "third-party";

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  payeeType: PayeeType;
  payeeId?: string;
}

export interface Profile {
  closing_day: number;
  monthly_budget: number;
}
