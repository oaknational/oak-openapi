export function slugToTitle(str: string) {
  return str
    .split('-')
    .reduce((acc, str) => acc + str[0].toUpperCase() + str.slice(1) + ' ', '');
}

export const getPathEnd = (path: string) => {
  const pathSlugs = path.split('/');
  return pathSlugs[pathSlugs.length - 1];
};

export const findObjectProperty = (obj: object, target: string) =>
  target in obj
    ? obj[target as keyof typeof obj]
    : Object.values(obj).reduce((acc, val): object | null | undefined => {
        if (acc !== undefined) return acc;
        if (typeof val === 'object') return findObjectProperty(val, target);
      }, undefined);
