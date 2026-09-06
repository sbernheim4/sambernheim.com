export const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const phaseOptions = [
  { value: "planning", label: "Planning" },
  { value: "implementation", label: "Implementation" },
  { value: "launched", label: "Launched" },
] as const;

export const budgetOptions = [
  { value: "$50k", label: "$50k" },
  { value: "$125k", label: "$125k" },
  { value: "$250k", label: "$250k" },
] as const;
