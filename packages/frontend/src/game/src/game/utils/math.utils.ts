export function posMod(x: number, m: number): number {
  return ((x % m) + m) % m
}

export function fract(x: number): number {
  return x - Math.floor(x)
}

export function lerp(a: number, b: number, i: number): number {
  return (1 - i) * a + i * b
}

//exponential interpolation. Use for camera zooms etc
export function eerp(a: number, b: number, i: number): number {
  return a * (b / a)**i
}

export function map(a: number, b: number, i: number): number {
  return clamp01((i - a) / (b - a))
}

export function inverseLerp(a: number, b: number, i: number): number {
  return map(a, b, i)
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

// use for smoothstep or inverse smoothstep with controllable exponent
// https://www.shadertoy.com/view/ldBfR1
export function gain01(x: number, P: number) {
  if (x > 0.5) {
    return 1 - 0.5 * (2 - 2 * x)**P
  } 
    return 0.5 * (2 * x)**P
  
}

export function smootherStep01(x: number): number {
  return x * x * x * (x * (x * 6 - 15) + 10)
}

export function smoothStep01(x: number): number {
  x = clamp01(x)
  return x * x * (3 - 2 * x)
}

export function invSmoothStep01(x: number): number {
  x = clamp01(x)
  return 0.5 - Math.sin(Math.asin(1 - 2 * x) / 3)
}

export function smoothStep(e0: number, e1: number, x: number): number {
  x = clamp((x - e0) / (e1 - e0), 0, 1)
  return x * x * (3 - 2 * x)
}

export function smootherStep(e0: number, e1: number, x: number): number {
  x = clamp((x - e0) / (e1 - e0), 0, 1)
  return smootherStep01(x)
}

export function lineairStep(e0: number, e1: number, x: number): number {
  return clamp01((x - e0) / (e1 - e0))
}

export function nearestPowerOfTwo(x: number): number {
  return 2**Math.round(Math.log2(x))
}

export function nextPowerOfTwo(x: number): number {
  return 2**Math.ceil(Math.log2(x))
}

export function isPowerOfTwo(x: number): boolean {
  return (x & (x - 1)) === 0
}

export function isNumber(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

export function isVector3(n: any): boolean {
  return n && isNumber(n.x) && isNumber(n.y) && isNumber(n.z)
}

export function smallerPowerOfTwo(x: number): number {
  return 2**Math.floor(Math.log2(x))
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export function degToRad(d: number): number {
  return d * (Math.PI / 180)
}

export function radToDeg(r: number): number {
  return r * (180 / Math.PI)
}

export function approximately(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.000_001
}

export function haltonSequence(index: number, base: number): number {
  let result = 0
  let f = 1
  let i = index
  while (i > 0) {
    f /= base
    result += f * (i % base)
    i = Math.floor(i / base)
  }
  return result
}
