export const sortByDistanceTo =
  (target: { x: number; y: number }) =>
  (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - target.x, a.y - target.y) -
    Math.hypot(b.x - target.x, b.y - target.y);

export const removeItem = <T>(array: T[], item: T) => {
  if (!array) return;
  let index;
  while ((index = array.indexOf(item)) !== -1) {
    array[index] = array[array.length - 1];
    array.pop();
  }
};
