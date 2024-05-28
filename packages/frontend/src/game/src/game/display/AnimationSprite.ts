import { Rectangle, Sprite, Texture } from 'pixi.js';
import { Signal } from '../core/Signal';

export class AnimationSprite extends Sprite {
  public readonly onEnd = new Signal();
  public readonly onLoop = new Signal();

  public totalFrames: number;
  private frameTextures: Texture[] = [];
  public isLooping: boolean = true;
  private isPlaying: boolean = true;
  private currentFrame = 0;

  constructor(texture: Texture, frameWidth: number) {
    super();

    this.totalFrames = texture.width / frameWidth;

    for (let i = 0; i < this.totalFrames; i++) {
      const frame = new Rectangle(i * frameWidth, 0, frameWidth, texture.height);
      this.frameTextures.push(new Texture({ source: texture.source, frame }));
    }
  }

  public gotoAndPlay(frame: number) {
    this.setFrame(frame);
    this.play();
  }

  public gotoAndStop(frame: number) {
    this.setFrame(frame);
    this.stop();
  }

  setFrame(frame: number) {
    this.currentFrame = frame;
    this.texture = this.frameTextures[frame];
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
  }

  public update() {
    if (!this.isPlaying) return;

    this.currentFrame++;
    if (this.currentFrame >= this.totalFrames) {
      if (this.isLooping) {
        this.onLoop.emit();
        this.currentFrame = 0;
      } else {
        this.currentFrame = this.totalFrames - 1;
        this.onEnd.emit();
        this.stop();
      }
    }
    this.setFrame(this.currentFrame);
  }

  public loop() {
    this.isLooping = true;
    return this;
  }

  public noLoop() {
    this.isLooping = false;
    return this;
  }

  public setPivot(x: number, y: number) {
    this.pivot.set(x, y);
    return this;
  }
}
