export const parseAllToNumber = <T extends Record<string, any>>(target: T) => {
  const newObj: any = {};

  for (const key in target) {
    newObj[key] = parseInt(target[key]);
  }

  return newObj as T;
};
