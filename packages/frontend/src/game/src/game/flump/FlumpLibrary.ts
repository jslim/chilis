import { Assets, Rectangle, Sprite, Texture } from 'pixi.js';
import { FlumpLibraryData, FlumpTexture } from './Flump.types';

export class FlumpLibrary {
  public data: FlumpLibraryData;
  public atlasTexture: Texture;
  private textures: Map<string, FlumpTexture> = new Map();

  constructor(flumpPath: string) {
    this.data = Assets.get(`${flumpPath}/json`);
    this.atlasTexture = Assets.get(`${flumpPath}/atlas`);
  }

  public hasMovie(symbol: string): boolean {
    return this.data.movies.some((movie) => movie.id === symbol);
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
        console.warn('no texture data found for symbol', symbol);
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
