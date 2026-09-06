export const ownerOptions = [
  { value: "alex", label: "Alex" },
  { value: "jordan", label: "Jordan" },
  { value: "morgan", label: "Morgan" },
] as const;

export const taskStatusOptions = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
] as const;

export const dueWindowOptions = [
  { value: "this-week", label: "This week" },
  { value: "next-week", label: "Next week" },
  { value: "this-month", label: "This month" },
] as const;
