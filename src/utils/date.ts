const timezoneSuffixPattern = /(Z|[+-]\d{2}:?\d{2})$/i;
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const parseUtcDate = (value: string | number | Date) => {
  if (value instanceof Date || typeof value === "number") {
    return new Date(value);
  }

  if (dateOnlyPattern.test(value)) {
    return new Date(`${value}T00:00:00Z`);
  }

  return new Date(timezoneSuffixPattern.test(value) ? value : `${value}Z`);
};

export const parseDateOnly = (value: string | Date) => {
  const date = value instanceof Date ? value : parseUtcDate(value);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};
