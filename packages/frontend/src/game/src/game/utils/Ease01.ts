export function linear01(t: number) {
  return t
}

export function smoothstep01(t: number) {
  return t * t * (3.0 - 2.0 * t)
}

export function smootherstep01(x: number): number {
  return x * x * x * (x * (x * 6 - 15) + 10)
}

export function invsmoothstep01(x: number): number {
  const s = x * x * (3 - 2 * x)
  return x + (x - s)
}

export function quadIn01(t: number) {
  return t * t
}

export function quadOut01(t: number) {
  return t * (2.0 - t)
}

export function quadInOut01(t: number) {
  return t <= 0.5 ? t * t * 2.0 : 1.0 - --t * t * 2.0
}

export function quadOutIn01(t: number) {
  return t < 0.5 ? -0.5 * (t = t * 2.0) * (t - 2.0) : 0.5 * (t = t * 2.0 - 1.0) * t + 0.5
}

export function powIn01(t: number) {
  return Math.pow(t, 5)
}

export function powOut01(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

export function circInOut01(t: number) {
  return t <= 0.5
    ? (Math.sqrt(1.0 - t * t * 4.0) - 1.0) / -2.0
    : (Math.sqrt(1.0 - (t * 2.0 - 2.0) * (t * 2.0 - 2.0)) + 1.0) / 2.0
}

export function circOutIn01(t: number) {
  return t < 0.5
    ? 0.5 * Math.sqrt(1.0 - (t = t * 2.0 - 1.0) * t)
    : -0.5 * (Math.sqrt(1.0 - (t = t * 2.0 - 1.0) * t) - 1.0 - 1.0)
}

export function cubeIn01(t: number) {
  return t * t * t
}

export function cubeOut01(t: number) {
  return 1.0 + --t * t * t
}

export function cubeInOut01(t: number) {
  return t <= 0.5 ? t * t * t * 4.0 : 1.0 + --t * t * t * 4.0
}

export function cubeOutIn01(t: number) {
  return 0.5 * ((t = t * 2.0 - 1.0) * t * t + 1.0)
}

export function quartIn01(t: number) {
  return t * t * t * t
}

export function quartOut01(t: number) {
  return 1.0 + --t * t * t * t
}

export function quartInOut01(t: number) {
  return t <= 0.5 ? t * t * t * t * 8.0 : (1.0 - (t = t * 2.0 - 2.0) * t * t * t) * 0.5 + 0.5
}

export function quartOutIn01(t: number) {
  return t < 0.5 ? -0.5 * (t = t * 2.0 - 1.0) * t * t * t + 0.5 : 0.5 * (t = t * 2.0 - 1.0) * t * t * t + 0.5
}

export function quintIn01(t: number) {
  return t * t * t * t * t
}

export function quintOut01(t: number) {
  return (t = t - 1) * t * t * t * t + 1.0
}

export function quintInOut01(t: number) {
  return (t *= 2.0) < 1.0 ? (t * t * t * t * t) / 2.0 : ((t -= 2.0) * t * t * t * t + 2.0) / 2.0
}

export function quintOutIn01(t: number) {
  return 0.5 * ((t = t * 2.0 - 1.0) * t * t * t * t + 1.0)
}

export function backIn01(t: number) {
  return t * t * (5.0 * t - 4.0)
}

export function backOut01(t: number) {
  return 1 - --t * t * (-5.0 * t - 4.0)
}

export function backInOut01(t: number) {
  t *= 2.0
  if (t < 1.0) return (t * t * (5.0 * t - 4.0)) / 2.0
  t -= 2.0
  return (1 - t * t * (-5.0 * t - 4.0)) / 2.0 + 0.5
}
