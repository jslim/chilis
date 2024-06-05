import {CoolDown} from "../../core/CoolDown";
import {CpuMover} from "./CpuMover";

export default class DinoCoolMover extends CpuMover {
  private readonly platforms: { direction: 'left' | 'right', y: number, x: number, width: number }[] = [];

  private readonly newPlatformCooldown = new CoolDown(1);
  private currentPlatform: number = -1;

  override onStart() {
    super.onStart();
    const walkGrid = this.level.walkGrid;
    if (walkGrid) {
      for (let y = 0; y < walkGrid.size; y++) {
        // platforms starting at the left
        let x = 0;
        let start = walkGrid.size;
        for (; x < walkGrid.size && (walkGrid.grid[y * walkGrid.size + x] || start >= walkGrid.size); x++) {
          if (walkGrid.grid[y * walkGrid.size + x]) {
            start = Math.min(start, x);
          }
        }
        let width = x - start;
        if (width > 1 && start < 40) this.platforms.push({direction: 'right', y, x: start, width});

        // platforms starting at the right
        x = walkGrid.size - 1;
        start = -1;
        for (; x >= 0 && (walkGrid.grid[y * walkGrid.size + x] || start < 0); x--) {
          if (walkGrid.grid[y * walkGrid.size + x]) {
            start = Math.max(start, x);
          }
        }
        width = start - x;
        if (width > 1 && start > 200) this.platforms.push({direction: 'left', y, x: start, width});
      }
    }
  }

  override walk(dt: number) {
    this.newPlatformCooldown.update(dt);
    if (this.currentPlatform < 0) {
      this.position.x = -100;
    }
    if (this.newPlatformCooldown.isExpired() && this.currentPlatform < 0) {
      this.currentPlatform = Math.floor(Math.random() * this.platforms.length);
      // move dino to start position
      const platform = this.platforms[this.currentPlatform];
      this.position.x = platform.x;
      this.position.y = platform.y;
      if (platform.direction === 'left') {
        this.left();
      } else {
        this.right();
      }
    } else if (this.currentPlatform >= 0) {
      const platform = this.platforms[this.currentPlatform];
      let hasMoved = false;
      if (this.currentDirection.value === 'left') {
        hasMoved = this.left();
        if (!hasMoved && platform.direction === 'left') {
          hasMoved = this.right(); // flip direction
        }
      } else {
        hasMoved = this.right();
        if (!hasMoved && platform.direction === 'right') {
          hasMoved = this.left(); // flip direction
        }
      }
      if (!hasMoved) {
        this.newPlatformCooldown.reset();
        this.currentPlatform = -1;
      }
    }
  }
}