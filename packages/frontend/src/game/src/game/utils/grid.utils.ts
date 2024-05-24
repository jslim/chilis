import { Point } from 'pixi.js'
import LevelScene from '../scenes/LevelScene'
import { getOppositeDirection } from '../components/Mover'

export function getMoveDirections(position: Point, level: LevelScene, currentDirection: string = ''): string[] {
  let { size, grid } = level.walkGrid

  let gridX = Math.floor(position.x)
  let gridY = Math.floor(position.y)

  let directions = []
  if (grid[gridX - 1 + gridY * size] > 0 && currentDirection !== getOppositeDirection('left')) directions.push('left')

  if (grid[gridX + 1 + gridY * size] > 0 && currentDirection !== getOppositeDirection('right')) directions.push('right')

  if (grid[gridX + (gridY - 1) * size] > 0 && currentDirection !== getOppositeDirection('up')) directions.push('up')

  if (grid[gridX + (gridY + 1) * size] > 0 && currentDirection !== getOppositeDirection('down')) directions.push('down')

  return directions
}

export function canMoveTo(x: number, y: number, level: LevelScene) {
  let { size, grid } = level.walkGrid
  let gridX = Math.floor(x)
  let gridY = Math.floor(y)
  return grid[gridX + gridY * size] > 0
}

export function canMove(x: number, y: number, dx: number, dy: number, level: LevelScene) {
  let { size, grid } = level.walkGrid
  let gridX = Math.floor(x) + Math.sign(dx)
  let gridY = Math.floor(y) + Math.sign(dy)
  return grid[gridX + gridY * size] > 0
}
