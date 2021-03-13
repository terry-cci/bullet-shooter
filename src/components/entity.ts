import { Board } from "../index";
import { Size, Vector, Velocity } from "./utils";

import Config from "../config";

const {
  BULLET_SIZE,
  TICK_INTERVAL,
  BOARD_SIZE,
  SHOOTER_SIZE,
  BULLET_SPEED,
} = Config;

export class DisplayElement {
  el: HTMLElement;
  pos: Vector;
  size: Size;

  constructor(el: HTMLElement, pos: Vector, size: Size) {
    this.el = el;
    this.pos = pos;
    this.size = size;

    Board.instance.el.appendChild(this.el);

    this.render();
  }

  public render() {
    this.el.style.setProperty("--x", `${this.pos.x - this.size.width / 2}px`);
    this.el.style.setProperty("--y", `${this.pos.y - this.size.height / 2}px`);
  }

  public destroy() {
    this.el.remove();
  }
}

export abstract class Entity extends DisplayElement {
  tickTimeout: NodeJS.Timeout;
  velocity: Velocity = new Velocity();

  constructor(el: HTMLElement, pos: Vector, size: Size, velocity: Velocity) {
    super(el, pos, size);

    this.velocity = velocity;

    this.tickTimeout = setInterval(() => {
      this.tick();
      this.move();
      this.render();
    }, TICK_INTERVAL);
  }

  public move() {
    this.pos.add(this.velocity.getDistance(TICK_INTERVAL));
  }

  public abstract tick(): void;

  public destroy() {
    this.el.remove();
    clearInterval(this.tickTimeout);
  }
}

export class Bullet extends Entity {
  constructor(pos: Vector, velocity: Velocity) {
    const el = document.createElement("div");
    el.classList.add("bullet");

    super(el, pos, BULLET_SIZE, velocity);
  }

  tick() {
    // outbound removal
    if (!Board.instance.isOnboard(this.pos)) {
      this.destroy();
    }
  }
}

export class Shooter extends DisplayElement {
  constructor() {
    // element
    const el = document.createElement("div");
    el.id = "shooter";

    super(
      el,
      new Vector(BOARD_SIZE.width / 2, BOARD_SIZE.width / 20),
      SHOOTER_SIZE
    );

    // moving
    document.body.addEventListener("mousemove", this.handleMoving.bind(this));
    document.body.addEventListener("mousedown", this.handleMoving.bind(this));

    // shooting
    document.body.addEventListener("mousedown", this.handleShooting.bind(this));

    this.render();
  }

  private handleMoving(e: MouseEvent) {
    const pos = Board.instance.boundPos(
      Board.instance.getPos(new Vector(e.clientX, e.clientY))
    );

    this.pos.x = pos.x;
    this.render();
  }

  private handleShooting() {
    const bulletPos = new Vector()
      .clone(this.pos)
      .add(new Vector(0, this.size.height / 2));

    new Bullet(bulletPos, BULLET_SPEED);
  }
}
