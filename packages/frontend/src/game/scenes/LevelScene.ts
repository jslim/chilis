import type {SimpleTextConfig} from '@/game/display/SimpleText';
import type {GameAction} from '@/game/GameAction';
import type {TiledMap} from '@/game/tiled/TiledMap';
import type {TiledWalkGrid} from '@/game/utils/tiles.utils';

import {Assets, Point, Rectangle, Sprite, Texture} from 'pixi.js';

import {PointerComponent} from '@/game/button/PointerComponent';
import {Cpu} from '@/game/components/cpu/Cpu';
import {CpuAnimator} from '@/game/components/cpu/CpuAnimator';
import {CpuMover} from '@/game/components/cpu/CpuMover';
import {DinoCool} from '@/game/components/cpu/DinoCool';
import {Matey} from '@/game/components/cpu/Matey';
import {MrBaggie} from '@/game/components/cpu/MrBaggie';
import {Piggles} from '@/game/components/cpu/Piggles';
import {Zapp} from '@/game/components/cpu/Zapp';
import {GamepadInput} from '@/game/components/input/GamepadInput';
import {Input} from '@/game/components/input/Input';
import {KeyboardInput} from '@/game/components/input/KeyboardInput';
import {MobileInput} from '@/game/components/input/MobileInput';
import {Burger, burgerHeightByTileId, burgerOverlap, BurgerTileSize} from '@/game/components/level/Burger';
import {BurgerGroup} from '@/game/components/level/BurgerGroup';
import {LevelComponent} from '@/game/components/level/LevelComponent';
import {Light} from '@/game/components/level/Light';
import {Plate} from '@/game/components/level/Plate';
import {OnStart} from '@/game/components/OnStart';
import {Pickup} from '@/game/components/Pickup';
import {Player} from '@/game/components/player/Player';
import {PlayerAnimator} from '@/game/components/player/PlayerAnimator';
import {PlayerPacManMover} from '@/game/components/player/PlayerPacManMover';
import {GameUI} from '@/game/components/ui/GameUI';
import {ScoreAnimation} from '@/game/components/ui/ScoreAnimation';
import {SimpleTextDisplay} from '@/game/components/ui/SimpleTextDisplay';
import {get8pxNumberFont, getPixGamerNumberFont} from '@/game/display/SimpleText';
import {FlumpAnimator} from '@/game/flump/FlumpAnimator';
import {TileId} from '@/game/tiled/TileId';
import {isMobileOrTablet} from '@/game/utils/is-mobile-or-tablet';
import {getRandom, pick} from '@/game/utils/random.utils';
import {connectionsToGrid, drawGrid, drawPointsAndConnections, getTileConnections} from '@/game/utils/tiles.utils';

import {AutoDisposer} from '../components/AutoDisposer';
import DinoCoolMover from "../components/cpu/DinoCoolMover";
import {HitBox} from '../components/HitBox';
import {createDelay} from '../core/Delay';
import {Entity} from '../core/Entity';
import {ScreenShake} from '../core/ScreenShake';
import {Signal} from '../core/Signal';
import {FlumpLibrary} from '../flump/FlumpLibrary';
import {DRAW_DEBUG_GRID, FLOOR_OFFSET, FRAME_RATE, FRAME_RATE_HARD, FRAME_RATE_HARDEST, getWrappedLevelNo, POINTS_PER_GROUP_COMPLETE} from '../game.config';
import {Scene} from './Scene';

const VIEW_OFFSET = {x: -12, y: 16};

export default class LevelScene extends Scene {
  public readonly onAllBurgersCompleted = new Signal();
  public map!: TiledMap;
  public player!: Entity;
  public cpus: Entity[] = [];
  public walkGrid!: TiledWalkGrid;
  public levelNo: number = 1;
  public burgers: Entity[] = [];
  public plates: Entity[] = [];
  public burgerGroups: BurgerGroup[] = [];
  public pickupSpawnPoints: Point[] = [];
  public flumpLibrary!: FlumpLibrary;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public containers = {
    back:        new Entity(),
    ui:          new Entity(),
    floor:       new Entity(),
    floorFront:  new Entity(),
    burgerParts: new Entity(),
    mid:         new Entity(),
    front:       new Entity(),
    scoreUI:     new Entity(),
  };
  private isPlaying: boolean = true;
  private readonly mainContainer = new Entity();
  private mobileInput?: MobileInput;

  override onStart() {
    super.onStart();

    this.sceneManager.gameController.onShowGameBorder.emit(true);

    if (this.levelNo <= 6) {
      this.sceneManager.frameRate = FRAME_RATE;
    } else if (this.levelNo <= 12) {
      this.sceneManager.frameRate = FRAME_RATE_HARD;
    } else {
      this.sceneManager.frameRate = FRAME_RATE_HARDEST;
    }
    console.log('frame rate', this.sceneManager.frameRate);

    this.entity.addChild(new Sprite(Assets.get('background')));

    this.entity.addEntity(this.mainContainer);
    Object.values(this.containers).forEach((container) => this.mainContainer.addEntity(container));
    this.mainContainer.x += VIEW_OFFSET.x;
    this.mainContainer.y += VIEW_OFFSET.y;

    const floorOffsetToFixLights = 6;
    this.mainContainer.y += floorOffsetToFixLights;
    this.containers.back.y -= floorOffsetToFixLights;
    this.containers.ui.x -= VIEW_OFFSET.x;
    this.containers.ui.y -= VIEW_OFFSET.y + floorOffsetToFixLights;
    //this.containers.mid.visible = false;

    this.subscribe(this.onAllBurgersCompleted, () => {
      this.isPlaying = false;
      this.player.getComponent(Player).state.value = 'victory';
      for (const cpu of this.cpus) {
        cpu.getComponent(Cpu).state.value = 'defeat';
      }
      createDelay(this.entity, 2, () => this.showWinScreen());
    });
  }

  async preload(levelNo: number): Promise<{
    map: TiledMap
    spriteSheet: Texture
    spriteSheetLarge: Texture
  }> {
    await Assets.loadBundle(`level${levelNo}`);
    const map = Assets.get(`level${levelNo}/jsonMap`);
    const spriteSheet: Texture = Assets.get(`level${levelNo}/tileset`);
    const spriteSheetLarge: Texture = Assets.get(`level${levelNo}/tileset_large`);
    return {map, spriteSheet, spriteSheetLarge};
  }

  async init(levelNo: number) {
    this.levelNo = levelNo;
    const {map, spriteSheet, spriteSheetLarge} = await this.preload(getWrappedLevelNo(levelNo));

    // store level number
    this.gameState.setLevel(levelNo);

    this.map = map;
    const path = getTileConnections(map, map.layers.find((l) => l.name === 'floor')!);

    this.flumpLibrary = new FlumpLibrary('flump');

    this.walkGrid = connectionsToGrid(map, path);
    const cpuId = 0;
    let traineeId = 1;
    for (const layer of map.layers) {
      // only process tile layers
      if (layer.type !== 'tilelayer') continue;

      // TODO: extras layer
      if (layer.name === 'extras') {
        // map to spawn points
        for (let i = 0; i < layer.data.length; i++) {
          const x = i % layer.width;
          const y = Math.trunc(i / layer.width);
          if (layer.data[i] === TileId.Pickup) {
            this.pickupSpawnPoints.push(new Point((x + 0.5) * map.tilewidth, (y + 1) * map.tileheight - FLOOR_OFFSET));
            // console.log('pickup', this.pickupSpawnPoints.at(-1))
          }
        }
        continue;
      }

      let i = 0;
      const layerData = layer.data;
      for (let id of layerData) {
        const x = i % layer.width;
        const y = Math.trunc(i / layer.width);
        if (id !== 0) {
          let container = this.containers.mid;

          const entity = new Entity();
          entity.addComponent(new LevelComponent(this));

          // remap tile ids for nicely designed level
          const hasStairsBelow = TileId.hasStairs(layerData[i + layer.width]);
          if (TileId.isFloor(id)) {
            id = hasStairsBelow ? TileId.FloorStairsNoUp : TileId.Floor;

            container = this.containers.floorFront;
          } else if (TileId.isStairsAndFloor(id)) {
            id = !hasStairsBelow ? TileId.FloorStairsNoDown : TileId.StairsAndFloor;

            container = this.containers.floorFront;
          } else if (TileId.isStairs(id)) {
            container = this.containers.floorFront;
          }

          // set position
          entity.position.set(x * map.tilewidth, y * map.tileheight);

          // add specific components
          if (id === TileId.Player) {
            this.player = entity.addComponent(
              new HitBox(-3, -10, 6, 8),
              new PlayerPacManMover(1.5),
              new Input(),
              new KeyboardInput(),
              new GamepadInput(),
              new Player(this.gameState.lives, this.gameState.bullets),
              new PlayerAnimator(this.flumpLibrary),
            );

            const playerComponent = this.player.getComponent(Player);
            this.subscribe(playerComponent.onDied, () => this.showDefeatScreen());
            this.subscribe(playerComponent.onHitCpu, () =>
              this.cpus.forEach((cpu) => (cpu.getComponent(Cpu).state.value = 'defeat')),
            );

            this.subscribe(playerComponent.onReset, () => this.cpus.forEach((cpu) => cpu.getComponent(Cpu).reset()));
          } else if (id === TileId.Cpu || id === TileId.BossCpu) {
            let cpu: Cpu | undefined;
            let offsetX = 0; // a visual offset for the animation
            if (id === TileId.Cpu) {
              cpu = new Cpu(`trainee0${traineeId++}` as 'trainee01' | 'trainee02' | 'trainee03');
            } else if (id === TileId.BossCpu) {
              offsetX = 4;
              switch (levelNo) {
                case 1: {
                  cpu = new Piggles('piggles');
                  break;
                }
                case 2: {
                  cpu = new DinoCool('dino');
                  break;
                }
                case 3: {
                  cpu = new MrBaggie('mrbaggie');
                  break;
                }
                case 4: {
                  cpu = new Matey('matey');
                  break;
                }
                case 5: {
                  cpu = new Zapp('zapp');
                  break;
                }
                case 6: {
                  cpu = new Piggles('piggles');
                  break;
                }
                // No default
              }
            }

            if (cpu) {
              entity.addComponent(
                new HitBox(-3, -9, 6, 8),
                cpu.name === 'dino' ? new DinoCoolMover(1, cpuId) : new CpuMover(1, cpuId),
                new CpuAnimator(this.flumpLibrary, cpu.name, offsetX),
                new Input(),
                cpu,
              );

              this.cpus.push(entity);

              if (cpu.name.includes('trainee')) {
                const mover = entity.getComponent(CpuMover);
                switch (traineeId) {
                  case 1: {
                    mover.modeCycle = ['hunt-player', 'hunt-player-slow', 'hunt-burger', 'random'];
                    break;
                  }
                  case 2: {
                    mover.modeCycle = ['random'];
                    break;
                  }
                  case 3: {
                    {
                      mover.modeCycle = ['hunt-burger', 'random'];
                      // No default
                    }
                    break;
                  }
                }
              }
            }
          } else if (TileId.isBurger(id)) {
            const burgerHeight = burgerHeightByTileId[id] - burgerOverlap;
            entity.addComponent(
              new HitBox(-BurgerTileSize.tilewidth / 2, -1, BurgerTileSize.tilewidth, burgerHeight),
              new Burger(spriteSheetLarge, id),
            );
            entity.position.x -= (BurgerTileSize.tilewidth - map.tilewidth) / 2;
            entity.position.x = Math.round(entity.position.x);
            container = this.containers.burgerParts;
            this.burgers.push(entity);
          } else if (id === TileId.Plate) {
            const isFloating = y < 12;
            const plateSprite = this.flumpLibrary.createSprite(!isFloating ? 'plate' : 'plate_floating');
            entity.addChild(plateSprite);
            entity.position.x -= (plateSprite.width - map.tilewidth) / 2;
            entity.position.x = Math.round(entity.position.x);
            const plateHeight = 3;
            entity.addComponent(new HitBox(-plateSprite.width / 2 + 4, -2, plateSprite.width, plateHeight), new Plate());
            this.plates.push(entity);
          } else {
            entity.addChild(getSprite(map, spriteSheet, id));
          }

          container.addEntity(entity);
        }
        i++;
      }
    }

    // depth sort this.containers.burgerParts from bottom to top
    this.containers.burgerParts.children.sort((a, b) => {
      return b.y - a.y;
    });

    for (const layer of map.layers) {
      // only process object layers
      if (layer.type !== 'objectgroup') continue;

      if (layer.name === 'lights') {
        for (const tiledObject of layer.objects) {
          const light = new Entity().addComponent(new Light(this.flumpLibrary, tiledObject.name));
          // the layer name is the reference to the image
          light.position.set(tiledObject.x, tiledObject.y);
          // round position to tiles
          light.x = Math.floor(light.x / map.tilewidth) * map.tilewidth;
          light.y = Math.floor(light.y / map.tileheight) * map.tileheight;
          // align light to center of tile
          light.x += Math.trunc(map.tilewidth / 2);
          light.y += 1;

          this.containers.back.addEntity(light);
        }
      }
    }

    this.createBurgerGroups();

    this.containers.ui.addComponent(new GameUI(this));

    if (DRAW_DEBUG_GRID) {
      this.containers.floorFront.addChild(drawPointsAndConnections(path));
      this.containers.floorFront.addChild(drawGrid(this.walkGrid));
    }

    // Add inbetween floor tiles
    path.points.forEach((point) => {
      if (Math.floor((point.x + map.tilewidth * 0.5) / (map.tilewidth * 0.5)) % 2 === 1) {
        const sprite = getSprite(map, spriteSheet, TileId.FloorInBetween);
        sprite.position.set(point.x - map.tilewidth / 2, point.y - map.tileheight);
        this.containers.floorFront.addChildAt(sprite, 0);
      }
    });

    if (isMobileOrTablet()) {
      this.containers.front.addEntity(new Entity().addComponent((this.mobileInput = new MobileInput(this))));
    }

    this.emitAction({a: 'start', l: this.gameState.level.value});
  }

  override onUpdate(dt: number): void {
    super.onUpdate(dt);
    if (this.isPlaying && this.checkIfAllBurgersCompleted()) {
      this.onAllBurgersCompleted.emit();
    }
  }

  showWinScreen() {
    this.mobileInput?.destroy();

    const screenEntity = new Entity().addComponent(new FlumpAnimator(this.flumpLibrary).setMovie('panel_win'));
    screenEntity.position.set(120, 120);

    const levelNo = this.gameState.level.value;
    const labelEntity = new Entity(this.flumpLibrary.createSprite(`label_level_completed`));
    labelEntity.position.set(0, -16);

    const labelNoEntity = new Entity().addComponent(
      new SimpleTextDisplay(`${levelNo}`, 'left', getPixGamerNumberFont()),
    );
    labelNoEntity.position.set(labelEntity.x + labelEntity.width / 2, labelEntity.y + 5);

    const buttonEntity = new Entity(this.flumpLibrary.createSprite(`button_next`)).addComponent(
      new PointerComponent('pointerdown', () => {
        this.sceneManager.levelComplete(this.gameState.getValues());
      }),
    );
    buttonEntity.position.set(0, 0);

    screenEntity.addComponent(
      new OnStart(() => {
        screenEntity.addEntity(labelEntity);
        screenEntity.addEntity(labelNoEntity);
      }),
    );
    createDelay(this.mainContainer, 1, () => {
      screenEntity.addEntity(buttonEntity);
    });

    this.entity.addEntity(screenEntity);

    this.emitAction({a: 'complete', l: this.gameState.level.value});
  }

  showDefeatScreen() {
    this.mobileInput?.destroy();

    const screenEntity = new Entity().addComponent(new FlumpAnimator(this.flumpLibrary).setMovie('panel_defeat'));
    screenEntity.position.set(120, 120);

    // const levelNo = this.gameState.level.value
    // let labelEntity = new Entity(this.flumpLibrary.createSprite(`label_defeat`))
    // labelEntity.position.set(0, -16)

    const buttonEntity = new Entity(this.flumpLibrary.createSprite(`button_defeat_next`)).addComponent(
      new PointerComponent('pointerdown', () => {
        this.sceneManager.end(this.gameState.getValues());
      }),
    );
    buttonEntity.position.set(0, 0);

    /*screenEntity.addComponent(
     new OnStart(() => {
     screenEntity.addEntity(labelEntity)
     })
     )*/
    createDelay(this.mainContainer, 1, () => {
      screenEntity.addEntity(buttonEntity);
    });

    this.entity.addEntity(screenEntity);

    this.emitAction({a: 'end', l: this.gameState.level.value});
  }

  checkIfAllBurgersCompleted() {
    return this.burgers.length > 0 && !this.burgerGroups.some((group) => !group.isCompleted);
  }

  public addScore(
    position: Point,
    points: number,
    color                        = 0xffc507,
    fontConfig: SimpleTextConfig = get8pxNumberFont(),
  ) {
    if (points <= 0) return;

    this.gameState.score.value += points;

    const pointsEntity = new Entity().addComponent(
      new SimpleTextDisplay(`${points}`, 'center', fontConfig).setTint(color),
      new ScoreAnimation(),
      new AutoDisposer(1),
    );
    pointsEntity.position.copyFrom(position);
    pointsEntity.position.y -= FLOOR_OFFSET + 9;
    this.containers.scoreUI.addEntity(pointsEntity);
  }

  createBurgerGroups(): void {
    // Sort entities by y to ensure burgers are always considered above plates
    const sortedEntities = [...this.burgers, ...this.plates].sort((a, b) => a.y - b.y);

    // Group by x
    const entitiesByX = new Map<number, Entity[]>();
    sortedEntities.forEach((entity) => {
      // Somehow, the x position is not exactly the same for burgers and plates
      const x = Math.round(entity.x / 4);
      entitiesByX.set(x, [...(entitiesByX.get(x) || []), entity]);
    });

    // console.log(entitiesByX)
    entitiesByX.forEach((entities) => {
      let currentBurgers: Entity[] = [];
      entities.forEach((entity) => {
        if (this.burgers.includes(entity)) {
          currentBurgers.push(entity);
        } else if (this.plates.includes(entity)) {
          // When a plate is found, create a new group with the accumulated burgers
          this.burgerGroups.push(new BurgerGroup(this, currentBurgers, entity));
          currentBurgers = []; // Reset burgers for the next potential group at the same x
        }
      });
    });

    // Listen for burger group completion, and add score
    this.subscribe(this.player.getComponent(Player).onHitCpu, () => {
      this.gameState.burgerCompleteCombo.value = 0;
    });

    let totalGroupsCompleted = 0;
    this.burgerGroups.forEach((group) => {
      this.subscribe(group.onBurgerComplete, () => {
        totalGroupsCompleted++;
        if (totalGroupsCompleted === 1) {
          this.spawnPickup();
        }

        this.gameState.burgerCompleteCombo.value++;
        const points = this.gameState.burgerCompleteCombo.value * POINTS_PER_GROUP_COMPLETE;

        this.emitAction({
          a: 'burger-complete',
          l: this.gameState.level.value,
          p: points,
          c: this.gameState.burgerCompleteCombo.value,
        });

        const position = group.plate.position.clone();
        position.x += 4;
        this.addScore(position, points, 0xffffff, getPixGamerNumberFont());
      });
    });
  }

  public spawnPickup() {
    const random = getRandom();
    const spawnPoint = pick(this.pickupSpawnPoints, random);

    const pickupId = (this.gameState.pickupsCollected.value % 3) + 1;
    const pickupSprite = this.flumpLibrary.createSprite(`pickup_${pickupId}`);
    const pickupEntity = new Entity(pickupSprite).addComponent(
      new LevelComponent(this),
      new AutoDisposer(30), // disposes after 30 seconds
      new Pickup(),
      new HitBox(-5, 6, 10, 8),
    );
    pickupEntity.position.copyFrom(spawnPoint);
    this.containers.mid.addEntity(pickupEntity);
  }

  public screenShake(amount: number, duration: number) {
    this.entity.addComponent(new ScreenShake(amount, duration));
  }

  public emitAction(action: GameAction) {
    this.sceneManager.gameController.onGameAction.emit(action);
  }
}

function getSprite(map: TiledMap, spriteSheet: Texture, id: number): Sprite {
  const {tilewidth, tileheight} = map;

  // tile ids are 1 based
  // eslint-disable-next-line no-param-reassign
  id -= 1;

  const totalTilesPerRow = spriteSheet.width / tilewidth;
  const tx = id % totalTilesPerRow;
  const ty = Math.trunc(id / totalTilesPerRow);
  const texture = new Texture({
    source: spriteSheet.source,
    frame:  new Rectangle(tx * tilewidth, ty * tileheight, tilewidth, tileheight),
  });
  return new Sprite(texture);
}