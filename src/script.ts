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

class Translation {
  dx: number;
  dy: number;

  constructor(dx: number, dy: number) {
    this.dx = dx;
    this.dy = dy;
  }
}

class Pos {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static relPos(a: Pos, b: Pos) {
    return new Pos(b.x - a.x, b.y - a.y);
  }

  public static fromMouseEvent(e: MouseEvent) {
    return new Pos(e.clientX, e.clientY);
  }

  public static clone(p: Pos) {
    return new Pos(p.x, p.y);
  }

  public translate(trans: Translation) {
    const newPos = Pos.clone(this);
    newPos.x += trans.dx;
    newPos.y += trans.dy;
    return newPos;
  }
}

class Speed {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getTranslation(interval: number) {
    const ratio = interval / 1000;
    return new Translation(this.x * ratio, this.y * ratio);
  }
}

class Board {
  static readonly TICK_INTERVAL = 16;
  static readonly SIZE = new Size(400, 600);

  el: HTMLElement;
  constructor(el: HTMLElement) {
    this.el = el;
  }

  public doesIncludeRelPos(p: Pos) {
    const boardRect = this.el.getBoundingClientRect();
    return (
      p.x >= 0 && p.x <= boardRect.width && p.y >= 0 && p.y <= boardRect.height
    );
  }

  public getRelPos(p: Pos) {
    const boardRect = this.el.getBoundingClientRect();
    const boardPos = new Pos(boardRect.left, boardRect.bottom);
    return Pos.relPos(boardPos, p);
  }
}

class Entity {
  el: HTMLElement;
  pos: Pos;
  size: Size;

  constructor(el: HTMLElement, p: Pos, s: Size) {
    this.el = el;
    this.pos = p;
    this.size = s;

    $board.appendChild(this.el);
  }

  public render() {
    this.el.style.setProperty("--x", `${this.pos.x - this.size.width / 2}px`);
    this.el.style.setProperty("--y", `${this.pos.y - this.size.height / 2}px`);
  }
}

class Bullet extends Entity {
  static SIZE = new Size(Board.SIZE.width / 50, Board.SIZE.width / 50);
  tickTimeout: NodeJS.Timeout;
  speed: Speed;

  constructor(pos: Pos, speed: Speed) {
    // element
    const el = document.createElement("div");
    el.classList.add("bullet");

    super(el, pos, Bullet.SIZE);

    // member
    this.speed = speed;

    // setup ticks
    this.tickTimeout = setInterval(() => {
      this.tick();
    }, Board.TICK_INTERVAL);

    this.render();
  }

  private tick() {
    if (board.doesIncludeRelPos(this.pos)) {
      // flying tick
      this.pos = this.pos.translate(
        this.speed.getTranslation(Board.TICK_INTERVAL)
      );
      this.render();
    } else {
      // outbound removal
      clearInterval(this.tickTimeout);
      this.el.remove();
    }
  }
}

class Shooter extends Entity {
  static readonly BULLET_SPEED = new Speed(0, 450);

  constructor() {
    const el = document.createElement("div");
    el.id = "shooter";

    super(
      el,
      new Pos(Board.SIZE.width / 2, Board.SIZE.width / 20),
      new Size(Board.SIZE.width / 10, Board.SIZE.width / 10)
    );
    // element

    // moving
    document.body.addEventListener("mousemove", (e) => {
      const pos = board.getRelPos(Pos.fromMouseEvent(e));
      const boardRect = board.el.getBoundingClientRect();

      this.pos.x = pos.x;
      this.pos.x = Math.max(pos.x, 0);
      this.pos.x = Math.min(pos.x, boardRect.width);
      this.render();
    });

    // shooting
    document.body.addEventListener("click", () => {
      new Bullet(
        this.pos.translate(new Translation(0, this.size.height / 2)),
        Shooter.BULLET_SPEED
      );
    });

    this.render();
  }
}

const $board = document.querySelector("main") as HTMLElement;
const board = new Board($board);

const shooter = new Shooter();

function setStyleConst(config: constConfig[]) {
  config.forEach((c) => {
    document.body.style.setProperty(`--${c.name}`, c.value);
  });
}

setStyleConst([
  { name: "board-width", value: `${Board.SIZE.width}px` },
  { name: "board-height", value: `${Board.SIZE.height}px` },
  { name: "shooter-width", value: `${shooter.size.width}px` },
  { name: "shooter-height", value: `${shooter.size.height}px` },
  { name: "bullet-width", value: `${Bullet.SIZE.width}px` },
  { name: "bullet-height", value: `${Bullet.SIZE.height}px` },
]);
