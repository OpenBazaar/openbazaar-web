// https://stackoverflow.com/a/7180095
export function move(arr, from, to) {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
}
