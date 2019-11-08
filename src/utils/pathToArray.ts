/**Parse path to array of keys. */
export default function pathToArray(path: string) {
  return path.split(/[.[\]]+/).filter(Boolean);
}