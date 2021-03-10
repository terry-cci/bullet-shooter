interface constConfig {
  name: string;
  value: string | null;
}

type Size = {
  w: number;
  h: number;
};

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
  static readonly SIZE: Size = {
    w: 400,
    h: 600,
  };

  el: HTMLElement;
  shooters: Shooter[] = [];

  constructor(el: HTMLElement) {
    this.el = el;
  }

  public addShooter(shooter: Shooter) {
    shooter.board = this;
    this.el.appendChild(shooter.el);

    this.shooters.push(shooter);
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

class Bullet {
  static readonly SIZE: Size = {
    w: Board.SIZE.w / 50,
    h: Board.SIZE.w / 50,
  };

  el: HTMLDivElement;
  pos: Pos;
  tickTimeout: NodeJS.Timeout;
  board: Board;
  speed: Speed;

  constructor(board: Board, pos: Pos, speed: Speed) {
    // member
    this.board = board;
    this.pos = Pos.clone(pos);
    this.speed = speed;

    // element
    this.el = document.createElement("div");
    this.el.classList.add("bullet");
    this.board.el.appendChild(this.el);

    // setup ticks
    this.tickTimeout = setInterval(() => {
      this.tick();
    }, Board.TICK_INTERVAL);

    this.render();
  }

  private tick() {
    if (this.board.doesIncludeRelPos(this.pos)) {
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

  private render() {
    this.el.style.setProperty("--y", `${this.pos.y - Bullet.SIZE.h / 2}px`);
    this.el.style.setProperty("--x", `${this.pos.x - Bullet.SIZE.w / 2}px`);
  }
}

class Shooter {
  static readonly SIZE: Size = {
    w: Board.SIZE.w / 10,
    h: Board.SIZE.w / 10,
  };
  static readonly BULLET_SPEED = new Speed(0, 450);

  el: HTMLDivElement;
  pos: Pos = new Pos(Board.SIZE.w / 2, Shooter.SIZE.h / 2);
  board!: Board;

  constructor() {
    // element
    this.el = document.createElement("div");
    this.el.id = "shooter";

    // moving
    document.body.addEventListener("mousemove", (e) => {
      const pos = this.board.getRelPos(Pos.fromMouseEvent(e));
      const boardRect = this.board.el.getBoundingClientRect();

      this.pos.x = pos.x;
      this.pos.x = Math.max(pos.x, 0);
      this.pos.x = Math.min(pos.x, boardRect.width);
      this.render();
    });

    // shooting
    document.body.addEventListener("click", (e) => {
      new Bullet(
        this.board,
        this.pos.translate(new Translation(0, Shooter.SIZE.h / 2)),
        Shooter.BULLET_SPEED
      );
    });

    this.render();
  }

  private render() {
    this.el.style.setProperty("--x", `${this.pos.x - Shooter.SIZE.w / 2}px`);
    this.el.style.setProperty("--y", `${this.pos.y - Shooter.SIZE.w / 2}px`);
  }
}

function setStyleConst(config: constConfig[]) {
  config.forEach((c) => {
    document.body.style.setProperty(`--${c.name}`, c.value);
  });
}

setStyleConst([
  { name: "board-width", value: `${Board.SIZE.w}px` },
  { name: "board-height", value: `${Board.SIZE.h}px` },
  { name: "shooter-width", value: `${Shooter.SIZE.w}px` },
  { name: "shooter-height", value: `${Shooter.SIZE.h}px` },
  { name: "bullet-width", value: `${Bullet.SIZE.w}px` },
  { name: "bullet-height", value: `${Bullet.SIZE.h}px` },
]);

const board = new Board(document.querySelector("main") as HTMLElement);
board.addShooter(new Shooter());
