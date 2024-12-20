import type LevelScene from '@/game/scenes/LevelScene'
import type { TiledWalkGrid } from './tiles.utils'
import type { Point } from 'pixi.js'

// eslint-disable-next-line import/no-cycle
import { getOppositeDirection } from '../components/Mover'

export function getMoveDirections(position: Point, level: LevelScene, currentDirection: string = ''): string[] {
  const { size, grid } = level.walkGrid

  const gridX = Math.floor(position.x)
  const gridY = Math.floor(position.y)

  const directions = []
  if (grid[gridX - 1 + gridY * size] > 0 && currentDirection !== getOppositeDirection('left')) directions.push('left')

  if (grid[gridX + 1 + gridY * size] > 0 && currentDirection !== getOppositeDirection('right')) directions.push('right')

  if (grid[gridX + (gridY - 1) * size] > 0 && currentDirection !== getOppositeDirection('up')) directions.push('up')

  if (grid[gridX + (gridY + 1) * size] > 0 && currentDirection !== getOppositeDirection('down')) directions.push('down')

  return directions
}

export function canMoveTo(x: number, y: number, level: LevelScene) {
  const { size, grid } = level.walkGrid
  const gridX = Math.floor(x)
  const gridY = Math.floor(y)
  return grid[gridX + gridY * size] > 0
}

export function canMove(x: number, y: number, dx: number, dy: number, level: LevelScene) {
  const { size, grid } = level.walkGrid
  const gridX = Math.floor(x) + Math.sign(dx)
  const gridY = Math.floor(y) + Math.sign(dy)
  return grid[gridX + gridY * size] > 0
}

export function getFloorPositionsAtX(grid: TiledWalkGrid, x: number): number[] {
  const floorPositions = []
  for (let idx = 0; idx < grid.grid.length; idx++) {
    const gx = idx % grid.size
    const gy = Math.floor(idx / grid.size)
    if (gx === x && grid.grid[idx] > 0) {
      floorPositions.push(gy)
    }
  }
  return floorPositions
}
