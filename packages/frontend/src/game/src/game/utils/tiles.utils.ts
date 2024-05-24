import { Graphics, Point } from "pixi.js";
import { TiledLayer, TiledMap } from "../tiled/TiledMap.ts";
import { TileId } from "../tiled/TileId.ts";
import { FLOOR_OFFSET } from "../game.config.ts";

// Define a type for the connections, which is a tuple of two points
export type TileConnection = [from: Point, to: Point];
export type TiledLayerPath = { points: Point[]; connections: TileConnection[] };
export type TiledWalkGrid = { grid: number[]; size: number };

export function getTileConnections(
  tiledMap: TiledMap,
  tiledLayer: TiledLayer,
): TiledLayerPath {
  let points: Point[] = [];
  const connections: TileConnection[] = [];

  // Tile dimensions
  const tileWidth = tiledMap.tilewidth;
  const tileHeight = tiledMap.tileheight;
  const grid = tiledLayer.data;

  const getTileId = (x: number, y: number) => grid[x + y * tiledLayer.width];

  const getPointInTile = (x: number, y: number, offsetX = 0, offsetY = 0) =>
    new Point(
      x * tileWidth + offsetX * tileWidth,
      y * tileHeight + offsetY * tileHeight,
    );

  const connect = (
    x: number,
    y: number,
    [offsetX1, offsetY1]: [number, number],
    [offsetX2, offsetY2]: [number, number],
  ) => {
    const from = getPointInTile(x, y, offsetX1, offsetY1);
    const to = getPointInTile(x, y, offsetX2, offsetY2);
    points.push(from, to);
    connections.push([from, to]);
  };

  for (let i = 0, leni = grid.length; i < leni; i++) {
    const x = i % tiledLayer.width;
    const y = (i / tiledLayer.width) | 0;
    const tileId = getTileId(x, y);
    const leftTileId = getTileId(x - 1, y);
    const rightTileId = getTileId(x + 1, y);
    if (TileId.isStairs(tileId)) {
      connect(x, y, [0.5, 0], [0.5, 1]);
    } else if (TileId.isStairsAndFloor(tileId)) {
      connect(x, y, [0.5, 0], [0.5, 1]);
      if (TileId.hasFloor(leftTileId)) connect(x, y, [0.0, 1], [0.5, 1]);
      if (TileId.hasFloor(rightTileId)) connect(x, y, [0.5, 1], [1, 1]);
    } else if (TileId.isFloor(tileId)) {
      if (TileId.hasFloor(leftTileId)) connect(x, y, [0.0, 1], [0.5, 1]);
      if (TileId.hasFloor(rightTileId)) connect(x, y, [0.5, 1], [1, 1]);
    }
  }

  // convert points on same x/y position to single point in both the connections and points arrays
  points.forEach((point, index, self) => {
    // replace points in connections to first occurrence of the point
    connections.forEach((connection) => {
      let [from, to] = connection;
      if (point !== from && from.x === point.x && from.y === point.y) {
        connection[0] = point;
      }
      if (point !== to && to.x === point.x && to.y === point.y) {
        connection[1] = point;
      }
    });
    // replace points in points array to first occurrence of the point
    for (let i = index + 1; i < self.length; i++) {
      if (self[i].x === point.x && self[i].y === point.y) {
        self[i] = point;
      }
    }
  });

  // make unique
  points.filter((value, index, array) => array.indexOf(value) === index);
  return { points, connections };
}

export function drawPointsAndConnections({
  points,
  connections,
}: TiledLayerPath): Graphics {
  let graphics = new Graphics();
  graphics.y -= FLOOR_OFFSET;
  connections.forEach((connection) => {
    let [from, to] = connection;
    graphics
      .moveTo(from.x, from.y)
      .lineTo(to.x, to.y)
      .stroke({ width: 2, color: 0xff0000 });
  });
  points.forEach((point) => {
    graphics.circle(point.x, point.y, 2).fill(0xffcc00);
  });
  return graphics;
}

export function connectionsToGrid(
  map: TiledMap,
  // layer: TiledLayer,
  { connections }: TiledLayerPath,
): TiledWalkGrid {
  const scale = 1;
  const gridWidth = map.width * map.tilewidth;
  const gridHeight = map.height * map.tileheight;
  const grid = Array.from(
    {
      length: (gridWidth * gridHeight) / scale,
    },
    () => 0,
  );
  for (let connection of connections) {
    let [from, to] = connection;
    for (
      let x = Math.min(from.x, to.x);
      x <= Math.max(from.x, to.x);
      x += scale
    ) {
      for (
        let y = Math.min(from.y, to.y);
        y <= Math.max(from.y, to.y);
        y += scale
      ) {
        grid[x / scale + (y / scale) * gridWidth] = 1;
      }
    }
  }
  return { grid, size: gridWidth };
}
export function drawGrid({ grid, size }: TiledWalkGrid) {
  let graphics = new Graphics();
  graphics.y -= FLOOR_OFFSET;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i]) {
      let x = i % size;
      let y = (i / size) | 0;
      graphics.rect(x, y, 1, 1).fill(0xffffff);
    }
  }
  return graphics;
}
