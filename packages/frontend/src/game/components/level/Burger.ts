/* eslint-disable no-labels */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-direct-mutation-state */
import type { PlayingSound } from '@mediamonks/channels'
import type { SoundName } from '@/game/assets.manifest'
import type LevelScene from '@/game/scenes/LevelScene'
import type { Entity } from '../../core/Entity'
import type { BurgerGroup } from './BurgerGroup'

import { Rectangle, Sprite, Texture } from 'pixi.js'

// eslint-disable-next-line import/no-cycle
import { Cpu } from '@/game/components/cpu/Cpu'
import { CoolDown } from '@/game/core/CoolDown'
import { getPixGamerNumberFont } from '@/game/display/SimpleText'
import { TileId } from '@/game/tiled/TileId'
import { pick } from '@/game/utils/random.utils'

import { Component } from '../../core/Entity'
import { Signal } from '../../core/Signal'
import { Value } from '../../core/Value'
import {
  DRAW_STATE_DEBUG,
  FLOOR_OFFSET,
  POINTS_PER_BURGER_BOUNCE,
  POINTS_PER_CPU,
  POINTS_PER_TOTAL_CPUS_HIT
} from '../../game.config'
import { HitBox } from '../HitBox'
import { Mover } from '../Mover'
import { StateDebugText } from '../StateDebugText'
import { LevelComponent } from './LevelComponent'

export const burgerOverlap = 1
export const burgerHeightByTileId = {
  [TileId.Burger1]: 7,
  [TileId.Burger2]: 4,
  [TileId.Burger3]: 5,
  [TileId.Burger4]: 6,
  [TileId.Burger5]: 3,
  [TileId.Burger6]: 2,
  [TileId.Burger7]: 2,
  [TileId.Burger8]: 7,
  [TileId.Burger9]: 11,
  [TileId.Burger10]: 7,
  [TileId.Burger11]: 7,
  [TileId.Burger12]: 7
}

export const BurgerTileSize = { tilewidth: 30, tileheight: 16 }

export class Burger extends Component {
  public readonly state = new Value<'idle' | 'bounce' | 'fall' | 'complete' | 'stopped'>('idle')

  public readonly onHitBurger = new Signal<Entity>()
  public readonly onHitPlate = new Signal<Entity>()
  public readonly onHitCpu = new Signal<Entity>()
  public readonly onComplete = new Signal<void>()
  public readonly onSlice = new Signal<void>()
  public readonly onSliceCompleted = new Signal<void>()
  public readonly onHitFloor = new Signal<void>()

  public group: BurgerGroup | undefined = undefined

  private readonly splicedSprites: Sprite[] = []
  private totalSlicesTouched: number = 0
  private targetY: number = 0
  private fallFrameId = 0
  private level!: LevelScene
  private readonly fallSpeed: number = 3

  private walkSoundLoop?: PlayingSound
  private readonly soundCoolDown = new CoolDown(0.1)

  private readonly targetPlateRect: Rectangle | undefined = undefined

  private readonly fallStats = {
    burgerHit: false,
    // this value is passed from one to another burger, to get sum of chain of burgers hit
    chainCollisionCount: 0
  }

  constructor(
    private readonly spriteSheet: Texture,
    private readonly tileId: number
  ) {
    super()
    this.soundCoolDown.setExpired()
  }

  get isIdle() {
    return this.state.value === 'idle'
  }

  public get isCompleted() {
    return this.state.value === 'complete'
  }

  override onStart() {
    super.onStart()

    this.level = this.entity.getComponent(LevelComponent).level
    //const sprite = get(this.spriteSheetLarge, this.tileId);

    this.walkSoundLoop = this.level.playSound('walk_over_burger_loop', true, 0)

    if (DRAW_STATE_DEBUG) {
      this.entity.addComponent(new StateDebugText(this.state as Value, [10, 7], this.entity.color))
    }

    const { tilewidth, tileheight } = BurgerTileSize

    this.entity.pivot.set(Math.floor(tilewidth / 2), tileheight)
    this.entity.x += this.entity.pivot.x
    this.entity.y += this.entity.pivot.y
    this.entity.pivot.y += FLOOR_OFFSET

    // break texture up horizontally per pixel
    const baseTextureFrame = getBurgerTextureFrame(this.spriteSheet, this.tileId)
    const textureWidth = baseTextureFrame.width
    const textureHeight = baseTextureFrame.height
    const pixelWidth = 3
    for (let x = 0; x < textureWidth; x += pixelWidth) {
      const frame = new Rectangle(baseTextureFrame.x + x, baseTextureFrame.y, pixelWidth, textureHeight)
      const texture = new Texture({
        source: this.spriteSheet.source,
        frame
      })
      const sliceSprite = new Sprite(texture)
      this.entity.addChild(sliceSprite)
      this.splicedSprites.push(sliceSprite)
      sliceSprite.pivot.y -= 4
      sliceSprite.x = x
    }

    this.findTargetPlate()

    // remove original sprite
    // sprite.destroy();

    this.subscribe(this.state.onChanged, (newState) => {
      switch (newState) {
        case 'idle': {
          this.fallFrameId = 0
          this.totalSlicesTouched = 0
          this.fallStats.chainCollisionCount = 0
          break
        }

        case 'bounce': {
          this.state.value = 'fall'
          break
        }

        case 'fall': {
          // if player lured a enemy on a burgerpart, it should kill them + give 1000 points
          let totalCpusHit = 0
          for (const cpuEntity of this.level.cpus) {
            if (this.intersectsWith(cpuEntity)) {
              totalCpusHit++
              this.onHitCpu.emit(cpuEntity)
              this.level.playSound('burger_hit_cpu')
            }
          }
          if (totalCpusHit > 0) {
            const points = POINTS_PER_TOTAL_CPUS_HIT[totalCpusHit]
            this.level.emitAction({ a: 'drop-enemy', l: this.level.gameState.level.value, p: points })
            this.level.addScore(this.entity.position, points, 0xffffff, getPixGamerNumberFont())
          }

          this.entity.y += 1
          this.targetY = this.findTargetY()
          this.level.playSound(pick(['burger_fall_a', 'burger_fall_b', 'burger_fall_c']) as SoundName)
          break
        }
        case 'complete': {
          this.onComplete.emit()
          break
        }
      }
    })

    this.subscribe(this.onSliceCompleted, () => {
      this.state.value = 'fall'
    })
    this.subscribe(this.onHitCpu, (cpu) => {
      cpu.getComponent(Cpu).onHitByBurger.emit(this)

      const cpuName = cpu.getComponent(Cpu).name
      const points = POINTS_PER_CPU[cpuName]
      this.level.addScore(this.entity.position, points)
      this.level.emitAction({ a: 'kill-enemy', l: this.level.gameState.level.value, p: points, n: cpuName })
    })
    this.subscribe(this.onHitBurger, (otherBurger) => {
      this.fallStats.burgerHit = true

      const otherBurgerComp = otherBurger.getComponent(Burger)
      otherBurgerComp.fallStats.chainCollisionCount = this.fallStats.chainCollisionCount + 1

      otherBurgerComp.state.value = 'bounce'
    })
    this.subscribe(this.onHitPlate, (_plate) => {
      this.calculateFallEndScoreAndShow()
      this.entity.getComponent(HitBox).hasIntersection = false
      this.state.value = 'complete'
    })
    this.subscribe(this.onHitFloor, (_plate) => {
      for (let i = 0; i < 10; i++) {
        this.stepUpdateSlicedParts()
      }
      const fallThrough = !this.fallStats.burgerHit

      if (fallThrough) {
        this.state.value = 'idle'
        this.state.value = 'fall'
      } else {
        this.calculateFallEndScoreAndShow()
        this.state.value = 'idle'
      }
    })
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    switch (this.state.value) {
      case 'idle': {
        this.updateIdle()
        break
      }

      case 'fall': {
        this.updateFall()
        break
      }

      case 'complete': {
        this.updateComplete()
        break
      }
    }

    if (!this.soundCoolDown.update(dt)) {
      this.walkSoundLoop?.setVolume(1)
    } else {
      this.walkSoundLoop?.setVolume(0)
    }
  }

  public isCurrentState(state: (typeof this.state)['value']) {
    return this.state.value === state
  }

  public intersectsWith(other: Entity) {
    return this.entity.getComponent(HitBox).intersects(other.getComponent(HitBox))
  }

  // wait for player touches
  private updateIdle() {
    const player = this.level.player
    const playerMover = player.getComponent(Mover)
    if (playerMover.hasMoved && Math.abs(player.y - this.entity.y) <= 1) {
      this.totalSlicesTouched = 0
      const MIN_X_DISTANCE = 9
      const MAX_Y_DOWN = 3
      for (const sliceSprite of this.splicedSprites) {
        if (
          Math.abs(this.entity.x + sliceSprite.x + sliceSprite.width / 2 - this.entity.pivot.x - player.x) <
          MIN_X_DISTANCE
        ) {
          const prevSliceSpriteY = sliceSprite.y
          sliceSprite.y += 1
          sliceSprite.y = Math.min(sliceSprite.y, MAX_Y_DOWN)

          if (prevSliceSpriteY !== sliceSprite.y) {
            this.soundCoolDown.reset()
          }

          if (prevSliceSpriteY !== sliceSprite.y && sliceSprite.y === MAX_Y_DOWN) {
            this.onSlice.emit()
          }
        }
        if (sliceSprite.y === MAX_Y_DOWN) this.totalSlicesTouched++
      }
    }

    // if all slices are touched, drop burger down
    const sliceForgiveness = 1
    if (this.totalSlicesTouched >= this.splicedSprites.length - sliceForgiveness) {
      this.onSliceCompleted.emit()
    }
  }

  private findTargetY() {
    // find y position in grid where burger will fall
    const { grid, size } = this.level.walkGrid
    const x = Math.floor(this.entity.x + this.entity.pivot.x)
    let y = Math.floor(this.entity.y)
    while (grid[x + y * size] === 0) {
      if (this.targetPlateRect && y >= this.targetPlateRect.y) {
        return this.targetPlateRect.y + 1
      }
      y++
    }
    return y
  }

  private updateFall() {
    if (this.entity.y < this.targetY) {
      // move burger down in pixel steps
      const frameTargetY = Math.min(this.entity.y + this.fallSpeed, this.targetY)

      const { cpus, burgers, plates } = this.level
      loop: while (this.entity.y < frameTargetY) {
        this.entity.y++

        // test if intersects with cpu
        for (const cpuEntity of cpus) {
          if (this.intersectsWith(cpuEntity)) {
            const cpu = cpuEntity.getComponent(Cpu)
            this.onHitCpu.emit(cpuEntity)
            this.level.playSound('burger_hit_cpu')
            break loop
          }
        }

        for (const plate of plates) {
          if (this.intersectsWith(plate)) {
            this.onHitPlate.emit(plate)
            break loop
          }
        }

        if (this.isCurrentState('fall')) {
          for (const otherBurger of burgers) {
            if (otherBurger === this.entity) continue
            const otherBurgerComponent = otherBurger.getComponent(Burger)
            if (this.intersectsWith(otherBurger)) {
              if (otherBurgerComponent.isIdle) {
                this.onHitBurger.emit(otherBurger)
              } else if (otherBurgerComponent.isCompleted) {
                this.onHitPlate.emit(otherBurger)
                break loop
              }
              break
            }
          }
        }
      }

      this.stepUpdateSlicedParts()
    } else {
      this.onHitFloor.emit()
      return
    }
  }

  // eslint-disable-next-line no-empty-function
  private updateComplete() {}

  private stepUpdateSlicedParts() {
    // slowly move sliced parts up
    this.fallFrameId++
    for (let i = 0; i < Math.floor(this.fallFrameId / 2); i++) {
      const slicedSprite1 = this.splicedSprites[i]
      if (slicedSprite1) {
        slicedSprite1.y--
        slicedSprite1.y = Math.max(slicedSprite1.y, 0)
      }
      const slicedSprite2 = this.splicedSprites[this.splicedSprites.length - 1 - i]
      if (slicedSprite2) {
        slicedSprite2.y--
        slicedSprite2.y = Math.max(slicedSprite2.y, 0)
      }
    }
  }

  private findTargetPlate() {
    const thisRect = this.entity.getComponent(HitBox).getRect()
    const tempRect1 = new Rectangle()
    const tempRect2 = new Rectangle()

    const platesOnSameRow = this.level.plates.filter((plate) => {
      const plateHitBox = plate.getComponent(HitBox)
      const plateRect = plateHitBox.getRect(tempRect1)
      return plateHitBox.contains(thisRect.x, plateRect.y)
    })
    // sort by closest y position to burger
    platesOnSameRow.sort((a, b) => {
      const aRect = a.getComponent(HitBox).getRect(tempRect1)
      const bRect = b.getComponent(HitBox).getRect(tempRect2)
      return aRect.y - bRect.y
    })
    return platesOnSameRow[0]
  }

  private calculateFallEndScoreAndShow() {
    // hack to prevent double scoring
    if (this.isCompleted) return

    let points = 0

    const pointsForBurgerHit = POINTS_PER_BURGER_BOUNCE[this.fallStats.chainCollisionCount]
    if (pointsForBurgerHit) {
      points += pointsForBurgerHit
      // reset
      this.fallStats.chainCollisionCount = 0
      this.level.emitAction({ a: 'burger-part', l: this.level.gameState.level.value, p: pointsForBurgerHit })
    }

    // reset
    this.fallStats.burgerHit = false

    this.level.addScore(this.entity.position, points)
  }
}

function getBurgerTextureFrame(spriteSheet: Texture, id: number): Rectangle {
  const { tilewidth, tileheight } = BurgerTileSize

  // tile ids are 1 based
  // eslint-disable-next-line no-param-reassign
  id -= 1

  const totalTilesPerRow = spriteSheet.width / tilewidth
  const tx = id % totalTilesPerRow
  const ty = Math.trunc(id / totalTilesPerRow)
  return new Rectangle(tx * tilewidth, ty * tileheight, tilewidth, tileheight)
}
