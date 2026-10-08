/** DOM id of the weight field of a set, used to focus a newly added set. */
export function weightInputId(setId: string): string {
  return `weight-${setId}`;
}
