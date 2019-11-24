/**Returns if a field name is child of the other. */
export function isFieldChild(field: string, toCompare: string) {
  //If is root.
  if ((field == null || field === '')) return true;

  const regxp = new RegExp(`^${field}(\\[\\d+\\]\\.|\\.).*`);

  return regxp.test(toCompare);
}