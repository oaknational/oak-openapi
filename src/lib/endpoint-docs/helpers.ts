export function slugToTitle(str: string): string {
  return str
    .split('-')
    .reduce((acc, str) => acc + str[0].toUpperCase() + str.slice(1) + ' ', '');
}

export const getPathEnd = (path: string): string => {
  const pathSlugs = path.split('/');
  return pathSlugs[pathSlugs.length - 1];
};

export const findObjectProperty = (obj: object, target: string): unknown => {
  return target in obj
    ? obj[target as keyof typeof obj]
    : Object.values(obj).reduce((acc, val): object | null | undefined => {
        if (acc !== undefined) {
          return acc;
        }
        if (typeof val === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return findObjectProperty(val, target) as object | null | undefined;
        }
      }, undefined);
};

export const findAllObjectProperties = (
  obj: object,
  target: string,
  ignore: string[] = [],
  omit: string[] = [],
): Record<string, object> => {
  let results: Record<string, object> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && ignore.indexOf(key) === -1) {
      if (target in (val as object) && omit.indexOf(key) === -1) {
        results[key] = val as object;
      }
      const nestedResults = findAllObjectProperties(
        val as object,
        target,
        ignore,
      );
      results = { ...results, ...nestedResults };
    }
  }
  return results;
};
