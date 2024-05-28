export type RandomFunction = (from?: number, to?: number) => number

export function getRandom(seed = Math.random()): RandomFunction {
  let current = seed
  return (from = 0, to = 1) => {
    let r = 1103515245 * ((current >> 1) ^ current++)
    r = 1103515245 * (r ^ (r >> 3))
    r = r ^ (r >> 16)
    const value = (r / 1103515245) % 1
    return from + value * (to - from)
  }
}

export function pick<T>(array: T[], random: RandomFunction): T {
  return array[(random() * array.length) | 0]
}
