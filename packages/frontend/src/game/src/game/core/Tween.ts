//
// Note: you have to call Tween.update in your own update loop!
// Declare the type of tween variable by (default type is number):
//
//    private myTween = new Tween(new Vector2(0,0));
// or
//    private myTween: Tween<Vector2>;
//

import { smoothstep01 } from '../utils/Ease01';
import { clamp01, lerp } from '../utils/math.utils';

export type TweenEasing = (t: number) => number;
export type TweenClassValue = {
  clone: () => TweenClassValue;
  lerp: (b: TweenValue, t: number) => TweenClassValue;
};
export type TweenValue = any | TweenClassValue;

export default class Tween<T extends TweenValue = number> {
  private _from!: T;
  private _target!: T;
  private _value!: T;
  private duration: number = 0;
  private _progress: number = 1;
  private easing: TweenEasing = smoothstep01;
  private onProgress: ((v: T) => void) | undefined = undefined;
  private onComplete: (() => void) | undefined = undefined;

  private isNumber: boolean = true;

  constructor(_from?: T) {
    this.from = _from!;
  }

  public get from(): T {
    return this._from;
  }

  private set from(value: T) {
    this.isNumber = typeof value === 'number';
    this._from = this.clone(value);
    this._value = this.clone(value);
  }

  public get completed(): boolean {
    return this.progress >= 1;
  }

  public get progress(): number {
    return this._progress;
  }

  public get easedProgress(): number {
    return this.easing(this._progress);
  }

  public get value(): T {
    return this._value;
  }

  public get target(): T {
    return this._target;
  }

  public to(
    goal: T,
    durationSeconds: number,
    onProgress: ((v: T) => void) | undefined = undefined,
    onComplete: (() => void) | undefined = undefined,
    easing: TweenEasing = smoothstep01,
  ): Tween<T> {
    this.from = this._value;
    this._target = this.clone(goal);

    this.duration = durationSeconds;
    this._progress = 0;

    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.easing = easing;

    return this;
  }

  public fromTo(
    value: T,
    goal: T,
    durationSeconds: number,
    onProgress: ((v: T) => void) | undefined = undefined,
    onComplete: (() => void) | undefined = undefined,
    easing: TweenEasing = smoothstep01,
  ): Tween<T> {
    this.from = value;
    return this.to(goal, durationSeconds, onProgress, onComplete, easing);
  }

  public cancel(): Tween<T> {
    this._progress = 1;
    this.onProgress = undefined;
    this.onComplete = undefined;
    return this;
  }

  public update(dt: number) {
    if (this._progress < 1) {
      this._progress = this.duration <= 0 ? 1 : clamp01(this._progress + dt / this.duration);
      this._value = this.lerp(this.from, this._target, clamp01(this.easing(this._progress)));

      if (this.onProgress !== undefined) {
        this.onProgress(this.value);
      }
      if (this._progress >= 1 && this.onComplete) {
        this.onComplete();
      }
    }
  }

  private clone(value: T) {
    return (this.isNumber ? value : (value as TweenClassValue).clone()) as T;
  }

  private lerp(a: T, b: T, t: number): T {
    return (
      this.isNumber
        ? lerp(a as number, b as number, t)
        : (a as TweenClassValue).clone().lerp(b as TweenClassValue, t)
    ) as T;
  }
}
