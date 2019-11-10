/**Returns the value of a change verifying if is inside a event.target. */
export default function getChangeValue(value: any){
  if(value.target){
    return value.target.value;
  }
  return value;
}