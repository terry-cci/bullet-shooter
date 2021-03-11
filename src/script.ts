interface constConfig {
  name: string;
  value: string | null;
}

class Size {
  width: number;
  height: number;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
}

class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public clone(v: Vector) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  public add(v: Vector) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  public subtract(v: Vector) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }
}
class Velocity extends Vector {
  public getDistance(dt: number) {
    const ratio = dt / 1000;
    return new Vector(this.x * ratio, this.y * ratio);
  }
}

class Board {
  el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  public get elRect() {
    return this.el.getBoundingClientRect();
  }

  public isOnboard(pos: Vector) {
    return (
      pos.x >= 0 &&
      pos.x <= this.elRect.width &&
      pos.y >= 0 &&
      pos.y <= this.elRect.height
    );
  }

  public getPos(absPos: Vector) {
    const boardPos = new Vector(this.elRect.left, this.elRect.bottom);

    const pos = new Vector().clone(absPos).subtract(boardPos);
    pos.y *= -1;

    return pos;
  }

  public boundPos(pos: Vector) {
    const p = new Vector().clone(pos);

    p.x = Math.min(this.elRect.width, Math.max(0, pos.x));
    p.y = Math.min(this.elRect.height, Math.max(0, pos.y));

    return p;
  }
}

class DisplayElement {
  el: HTMLElement;
  pos: Vector;
  size: Size;

  constructor(el: HTMLElement, pos: Vector, size: Size) {
    this.el = el;
    this.pos = pos;
    this.size = size;

    $board.appendChild(this.el);
  }

  public render() {
    this.el.style.setProperty("--x", `${this.pos.x - this.size.width / 2}px`);
    this.el.style.setProperty("--y", `${this.pos.y - this.size.height / 2}px`);
  }
}

class Entity extends DisplayElement {
  velocity: Velocity = new Velocity();

  constructor(el: HTMLElement, pos: Vector, size: Size) {
    super(el, pos, size);
  }

  public move(dt: number) {
    this.pos.add(this.velocity.getDistance(dt));
  }
}

class Bullet extends Entity {
  tickTimeout: NodeJS.Timeout;

  constructor(pos: Vector, velocity: Velocity) {
    const el = document.createElement("div");
    el.classList.add("bullet");

    super(el, pos, BULLET_SIZE);

    this.velocity = velocity;

    this.tickTimeout = setInterval(() => {
      this.tick();
    }, TICK_INTERVAL);

    this.render();
  }

  private tick() {
    if (board.isOnboard(this.pos)) {
      // flying tick
      this.pos.add(this.velocity.getDistance(TICK_INTERVAL));
      this.render();
    } else {
      // outbound removal
      clearInterval(this.tickTimeout);
      this.el.remove();
    }
  }
}

class Shooter extends Entity {
  constructor() {
    const el = document.createElement("div");
    el.id = "shooter";

    super(
      el,
      new Vector(BOARD_SIZE.width / 2, BOARD_SIZE.width / 20),
      SHOOTER_SIZE
    );
    // element

    // moving
    document.body.addEventListener("mousemove", (e) => {
      const pos = board.boundPos(
        board.getPos(new Vector(e.clientX, e.clientY))
      );

      this.pos.x = pos.x;
      this.render();
    });

    // shooting
    document.body.addEventListener("mousedown", () => {
      const bulletPos = new Vector()
        .clone(this.pos)
        .add(new Vector(0, this.size.height / 2));

      new Bullet(bulletPos, BULLET_SPEED);
    });

    this.render();
  }
}

const TICK_INTERVAL = 16;
const BOARD_SIZE = new Size(400, 600);
const SHOOTER_SIZE = new Size(BOARD_SIZE.width / 10, BOARD_SIZE.width / 10);
const BULLET_SIZE = new Size(SHOOTER_SIZE.width / 5, SHOOTER_SIZE.height / 5);
const BULLET_SPEED = new Velocity(0, 450);

const $board = document.querySelector("main") as HTMLElement;
const board = new Board($board);

new Shooter();

function setStyleConst(config: constConfig[]) {
  config.forEach((c) => {
    document.documentElement.style.setProperty(`--${c.name}`, c.value);
  });
}

setStyleConst([
  { name: "board-width", value: `${BOARD_SIZE.width}px` },
  { name: "board-height", value: `${BOARD_SIZE.height}px` },
  { name: "shooter-width", value: `${SHOOTER_SIZE.width}px` },
  { name: "shooter-height", value: `${SHOOTER_SIZE.height}px` },
  { name: "bullet-width", value: `${BULLET_SIZE.width}px` },
  { name: "bullet-height", value: `${BULLET_SIZE.height}px` },
]);
