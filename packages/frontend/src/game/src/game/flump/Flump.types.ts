import { Texture } from 'pixi.js';

export type FlumpTexture = {
  symbol: string;
  origin: [x: number, y: number];
  rect: [x: number, y: number, width: number, height: number];
  texture: Texture;
};

export type FlumpAtlas = {
  file: string;
  textures: FlumpTexture[];
};

export type FlumpTextureGroup = {
  atlases: FlumpAtlas[];
  scaleFactor: number;
};

export type FlumpKeyFrame = {
  ref: string | undefined;
  index: number;
  pivot: [x: number, y: number];
  duration: number;
  loc: [x: number, y: number];
  // tweened: boolean;
  // skew: [number, number];
  alpha: number;
};

export type FlumpLayer = {
  keyframes: FlumpKeyFrame[];
  flipbook: boolean;
  name: string;
};

export type FlumpMovieData = {
  layers: FlumpLayer[];
  id: string;
};

export type FlumpLibraryData = {
  movies: FlumpMovieData[];
  frameRate: number;
  textureGroups: FlumpTextureGroup[];
  // isNamespaced: boolean;
  // md5: string;
};
