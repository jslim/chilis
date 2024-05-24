import { Container } from "pixi.js";
import { getRandom } from "../utils/random.utils.ts";
import { Signal } from "./Signal.ts";

type ComponentClass = Function;

const random = getRandom(777);
const getRandomColor = () =>
  65536 * ((random(0, 4) | 0) * 64) +
  256 * ((random(0, 4) | 0) * 64) +
  (random(0, 4.4) | 0) * 64;

export class Entity extends Container {
  components = new Map<ComponentClass, Component>();
  entities: Entity[] = [];

  // use this cache to be able to get component by parent class
  // eg. if you have component C extends B extends A extends Component, you can get C by getComponent(A)
  componentTypeCache = new Map<ComponentClass, Component>();

  timescale: number = 1.0;
  color = getRandomColor();

  constructor(sprite?: Container) {
    super();
    if (sprite) {
      this.addChild(sprite);
    }
  }

  public onUpdate(dt: number) {
    dt *= this.timescale;
    for (const [_, component] of this.components) {
      if (!component.entity) continue;
      if (!component.isStarted) {
        component.isStarted = true;
        component.onStart();
      }
      component.onUpdate(dt);
    }
    for (const childEntity of this.entities) {
      childEntity.onUpdate(dt);
    }
  }

  public addEntity(child: Entity, addToDisplayList = true): this {
    if (addToDisplayList) this.addChild(child);
    this.entities.push(child);
    return this;
  }

  public addComponent(...components: Component[]): this {
    for (const component of components) {
      const componentClass = component.constructor as ComponentClass;
      this.components.set(componentClass, component);
      component.entity = this;
      this.mapInheritance(component, true);
    }
    return this;
  }

  private mapInheritance(component: Component, add: boolean): void {
    let currentProto = Object.getPrototypeOf(component);
    while (
      currentProto &&
      currentProto.constructor !== Object &&
      currentProto.constructor !== Component
    ) {
      if (add) {
        this.componentTypeCache.set(currentProto.constructor, component);
      } else {
        this.componentTypeCache.delete(currentProto.constructor);
      }
      currentProto = Object.getPrototypeOf(currentProto);
    }
  }

  public removeComponent(component: Component): this {
    const componentClass = component.constructor as ComponentClass;
    if (this.components.has(componentClass)) {
      // @ts-ignore
      component.entity = undefined;
      this.mapInheritance(component, false);
    }
    return this;
  }

  public getComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
  ): T {
    return this.componentTypeCache.get(componentClass) as T;
  }

  public override destroy() {
    for (const [_, component] of this.components) {
      this.mapInheritance(component, false);
      component.destroy();
    }
    for (const entity of this.entities) {
      entity.destroy();
    }

    this.parent?.removeChild(this);
    super.destroy();
  }
}

export class Component {
  protected disposables: (() => void)[] = [];
  public isStarted = false;
  public entity!: Entity;
  public onUpdate(_dt: number) {}
  public onStart(): void {}
  public destroy(): void {
    this.disposables.forEach((d) => d());
    this.disposables = [];
    this.entity?.removeComponent(this);
  }
  protected subscribe<T>(signal: Signal<T>, callback: (value: T) => void) {
    this.disposables.push(signal.subscribe(callback));
  }
}
