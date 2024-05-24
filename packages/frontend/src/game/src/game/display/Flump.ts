import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { Component } from "../core/Entity.ts";
import { Signal } from "../core/Signal.ts";
import { Value } from "../core/Value.ts";

type FlumpTexture = {
  symbol: string;
  origin: [number, number];
  rect: [x: number, y: number, width: number, height: number];
  texture: Texture;
};

type FlumpAtlas = {
  file: string;
  textures: FlumpTexture[];
};

type FlumpTextureGroup = {
  atlases: FlumpAtlas[];
  scaleFactor: number;
};

type FlumpKeyframe = {
  ref: string | undefined;
  index: number;
  pivot: [number, number];
  duration: number;
  loc: [number, number];
  // skew: [number, number];
  alpha: number;
};

type FlumpLayer = {
  keyframes: FlumpKeyframe[];
  name: string;
};

type FlumpMovie = {
  layers: FlumpLayer[];
  id: string;
};

type FlumpData = {
  movies: FlumpMovie[];
  md5: string;
  frameRate: number;
  isNamespaced: boolean;
  textureGroups: FlumpTextureGroup[];
};

export class FlumpLibrary {
  public data: FlumpData;
  public atlasTexture: Texture;
  private textures: Map<string, FlumpTexture> = new Map();

  constructor(flumpPath: string) {
    this.data = Assets.get(`${flumpPath}/json`);
    this.atlasTexture = Assets.get(`${flumpPath}/atlas`);
    /*
        this.data.textureGroups.forEach((group) => {
          group.atlases.forEach((atlas) => {
            atlas.textures.forEach((textureData) => {
              const texture = new Texture({
                source: atlasTexture.source,
                frame: new Rectangle(...textureData.rect),
              });
              this.textures.set(textureData.symbol, { ...textureData, texture });
            });
          });
        });*/
  }

  public getTexture(symbol: string): FlumpTexture {
    if (!this.textures.has(symbol)) {
      //assume theres only one atlas and one texture group
      const atlas = this.data.textureGroups[0]!.atlases[0]!;
      const textureData = atlas.textures.find((t) => t.symbol === symbol);
      if (textureData) {
        const texture = new Texture({
          source: this.atlasTexture.source,
          frame: new Rectangle(...textureData.rect),
        });
        this.textures.set(textureData.symbol, { ...textureData, texture });
      } else {
        console.warn("no texture data found for symbol", symbol);
      }
    }
    return this.textures.get(symbol)!;
  }

  public createSprite(symbol: string) {
    const textureData = this.getTexture(symbol);
    const sprite = new Sprite(textureData.texture);
    sprite.anchor.set(
      textureData.origin[0] / textureData.texture.width,
      textureData.origin[1] / textureData.texture.height,
    );
    return sprite;
  }
}

function sum(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export class FlumpMovieSprite extends Container {
  public readonly onEnd = new Signal();
  public readonly onLoop = new Signal();

  public readonly movieData: FlumpMovie;
  public readonly totalFrames: number;
  private currentFrame = 0;
  private currentKeyFrame: FlumpKeyframe | undefined = undefined;

  public isPlaying = true;
  public isLooping = true;

  constructor(
    private library: FlumpLibrary,
    public readonly movieName: string,
  ) {
    super();

    this.movieData = this.library.data.movies.find(
      (movie) => movie.id === movieName,
    )!;

    // amount of layers is fixed, create sprite for each
    this.movieData.layers.forEach(() => this.addChild(new Sprite()));

    const firstLayer = this.movieData.layers[0];
    this.totalFrames = sum(firstLayer.keyframes.map((frame) => frame.duration));
    this.setFrame(this.currentFrame);
  }

  public gotoAndPlay(frame: number) {
    this.setFrame(frame);
    this.play();
  }

  public gotoAndStop(frame: number) {
    this.setFrame(frame);
    this.stop();
  }

  getFrame(frameNo: number, layer: FlumpLayer): FlumpKeyframe {
    let frame = layer.keyframes[0];
    for (let keyframe of layer.keyframes) {
      if (keyframe.index === frameNo) return keyframe;
      else if (keyframe.index > frameNo) {
        return frame;
      } else {
        frame = keyframe;
      }
    }
    return frame;
  }

  setFrame(frame: number) {
    this.currentFrame = frame;

    this.movieData.layers.forEach((layer, idx) => {
      const layerSprite = this.children[idx]! as Sprite;
      const keyframe = this.getFrame(this.currentFrame, layer);
      if (keyframe !== this.currentKeyFrame) {
        this.currentKeyFrame = keyframe;
        if (keyframe.ref) {
          let textureData = this.library.getTexture(keyframe.ref);

          layerSprite.texture = textureData.texture;
          layerSprite.anchor.set(
            textureData.origin[0] / textureData.rect[2],
            textureData.origin[1] / textureData.rect[3],
          );
          if (keyframe.pivot)
            layerSprite.pivot.set(keyframe.pivot[0] | 0, keyframe.pivot[1] | 0);
          layerSprite.position.set(keyframe.loc[0] | 0, keyframe.loc[1] | 0);
          layerSprite.alpha = keyframe.alpha ?? 1;
          layerSprite.visible = true;
          //console.log(this.currentFrame, keyframe, textureData);
        } else {
          layerSprite.visible = false;
        }
      }
    });
  }

  public stop() {
    this.isPlaying = false;
  }

  public play() {
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
}

export class FlumpAnimator extends Component {
  protected root = new Container();

  protected cache = new Map<string, FlumpMovieSprite>();
  protected currentMovie = new Value<FlumpMovieSprite | undefined>(undefined);

  constructor(private library: FlumpLibrary) {
    super();
  }

  override onStart() {
    super.onStart();

    this.entity.addChild(this.root);
    this.subscribe(this.currentMovie.onChanged, (sprite) => {
      this.root.removeChildren();
      if (sprite) this.root.addChild(sprite);
    });

    this.root.removeChildren();
    if (this.currentMovie.value) this.root.addChild(this.currentMovie.value);
  }

  public setMovie(movieName: string) {
    if (
      !this.currentMovie.value ||
      this.currentMovie.value.movieName !== movieName
    ) {
      if (this.cache.has(movieName)) {
        console.log("set movie [cache]", movieName);
        this.currentMovie.value = this.cache.get(movieName)!;
      } else {
        this.cache.set(
          movieName,
          new FlumpMovieSprite(this.library, movieName),
        );
        console.log("set movie [new]", movieName, this.cache.get(movieName));
        this.currentMovie.value = this.cache.get(movieName)!;
      }
    }
    return this;
  }

  public gotoAndPlay(frame: number) {
    this.currentMovie.value?.gotoAndPlay(frame);
    return this;
  }

  public gotoAndStop(frame: number) {
    this.currentMovie.value?.gotoAndStop(frame);
    return this;
  }

  public stop() {
    this.currentMovie.value?.stop();
    return this;
  }

  public play() {
    this.currentMovie.value?.play();
    return this;
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);
    this.currentMovie.value?.update();
  }

  public flipToRight() {
    this.entity.scale.x = -1;
  }

  public flipToLeft() {
    this.entity.scale.x = 1;
  }

  public flipNeutral() {
    this.entity.scale.x = 1;
  }

  override destroy() {
    super.destroy();
    this.root.destroy();
  }
}
