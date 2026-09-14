/** Lay ra mot so key tu object (bo qua key khong ton tai / undefined). */
export function pick(source = {}, keys = []) {
  return keys.reduce((result, key) => {
    if (source != null && Object.hasOwn(source, key) && source[key] !== undefined) {
      result[key] = source[key];
    }
    return result;
  }, {});
}

/** Loai bo mot so key khoi object. */
export function omit(source = {}, keys = []) {
  const result = { ...source };
  for (const key of keys) delete result[key];
  return result;
}

/** Loai bo cac gia tri undefined/null/chuoi rong - huu ich khi build filter MongoDB. */
export function compact(source = {}) {
  return Object.fromEntries(
    Object.entries(source).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}
