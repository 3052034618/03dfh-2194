export const generateId = (prefix = 'id'): string => {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const cn = (...args: (string | undefined | null | false)[]): string => {
  return args.filter(Boolean).join(' ');
};
