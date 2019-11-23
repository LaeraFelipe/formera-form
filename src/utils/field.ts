/**Returns if a field name is child of the other. */
export function isFieldChild(field: string, toCompare: string){
  return field !== toCompare && toCompare.startsWith(field);
}