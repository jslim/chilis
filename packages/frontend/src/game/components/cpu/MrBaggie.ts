import { Point } from 'pixi.js'

import { Bullet } from '@/game/components/level/Bullet'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { createDelay } from '@/game/core/Delay'
import { FlumpAnimator } from '@/game/flump/FlumpAnimator'

import { Entity } from '../../core/Entity'
import { HitBox } from '../HitBox'
import { Mover } from '../Mover'
import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

export class MrBaggie extends Cpu {
  private stairsPositions: number[] = []
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3
    this.attackCoolDown.interval = 0.2
    this.walksWhenPrepareAttack = false
    this.autoCompleteAttack = true

    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1.5)
    mover.modeCycle = ['random']

    mover.directionAccuracy = 0

    // find all x positions in the walk grid that have a filled tile below
    const level = this.level!
    const gridSize = level.walkGrid.size
    level.walkGrid.grid.forEach((pixel, idx) => {
      const x = idx % gridSize
      const y = Math.trunc(idx / gridSize)
      if (
        !this.stairsPositions.includes(x) &&
        pixel === 1 &&
        y < gridSize - 1 &&
        level.walkGrid.grid[x + (y + 1) * gridSize] === 1
      ) {
        this.stairsPositions.push(x)
      }
    })
    // remove every odd x position (ingredients fall there)
    this.stairsPositions.sort((a, b) => a - b)
    this.stairsPositions = this.stairsPositions.filter((_, idx) => idx % 2 === 0)

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack': {
          break
        }

        case 'attack': {
          this.shoot()
          this.attackCoolDown.reset()
          break
        }
      }
    })
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    const roundedX = Math.round(this.entity.x / 4) * 4
    const isXOnStairs = this.stairsPositions.includes(roundedX)

    switch (this.state.value) {
      case 'walk': {
        const mover = this.entity.getComponent(CpuMover)
        if (!mover.isClimbing() && isXOnStairs && this.attackCoolDown.update(dt)) {
          this.state.value = 'prepare_attack'
          this.attackCoolDown.reset()
        }
        break
      }
    }
  }

  shoot() {
    if (this.level) {
      const playerHitBoxRect = this.entity

      const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y)

      const moverInner = this.entity.getComponent(Mover)
      const bulletSize = { width: 17, height: 4 }
      const bulletOffset = -bulletSize.width / 2
      if (moverInner.currentDirection.value === 'left') bulletPos.x -= bulletSize.width + bulletOffset
      else if (moverInner.currentDirection.value === 'right') bulletPos.x += bulletOffset

      const bulletMovie = new FlumpAnimator(this.level.flumpLibrary)
      bulletMovie.setMovie('mrbaggie_ball').gotoAndPlay(0).once()
      const bullet = new Entity().addComponent(
        bulletMovie,
        new LevelComponent(this.level!),
        new Bullet('player_speed'),
        new HitBox(0, 10, bulletSize.width, bulletSize.height)
      )

      createDelay(bullet, 10, () => {
        bulletMovie.setMovie('mrbaggie_ball_out').gotoAndPlay(0).once()
        bullet.getComponent(HitBox).isActive.value = false
        this.subscribeOnce(bulletMovie.currentMovie.value!.onEnd, () => {
          bullet.destroy()
        })
      })

      bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height - 8)

      //createDelay(this.entity, 0.3, () => {
      this.level?.containers.floorFront.addEntity(bullet)
      //  mover.currentDirection.value = getOppositeDirection(mover.currentDirection.value)
      //})

      //this.state.value = 'attack_complete'
    }
  }
}
