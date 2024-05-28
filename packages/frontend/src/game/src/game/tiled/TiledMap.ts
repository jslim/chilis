export interface TiledMap {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: TiledLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: Tileset[];
  tilewidth: number;
  type: string;
  version: string;
  width: number;
}

export interface TiledLayer {
  data: number[];
  objects: TiledObject[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: 'objectgroup' | 'tilelayer';
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export interface Tileset {
  firstgid: number;
  source: string;
}

export interface TiledObject {
  height: number;
  id: number;
  name: string;
  point: boolean;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}
