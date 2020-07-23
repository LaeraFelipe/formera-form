const FIELD_DELIMITER_CHARACTERS = ['[', '.'];

/**Returns if a field name is child of the other. */
export function isFieldChild(field: string, toCompare: string) {
  //If is root.
  if (field == null || field === '') {
    return true;
  }

  if (toCompare.startsWith(field) && toCompare.length > (field.length + 1)) {
    if (FIELD_DELIMITER_CHARACTERS.indexOf(toCompare[field.length]) > -1) {
      return true;
    }
  }

  return false;
}