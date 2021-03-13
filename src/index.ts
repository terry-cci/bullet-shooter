import "./style.scss";

import { Size, Vector } from "./components/utils";
import { Shooter } from "./components/entity";

import Config from "./config";

export class Board {
  static instance: Board;
  el: HTMLElement;

  constructor(el: HTMLElement) {
    Board.instance = this;

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

const $board = document.querySelector("main") as HTMLElement;
new Board($board);
new Shooter();

interface ConstConfig {
  name: string;
  value: string;
}

function setStyleConst(config: ConstConfig[]) {
  config.forEach((c) => {
    document.documentElement.style.setProperty(`--${c.name}`, c.value);
  });
}

const { BULLET_SIZE, BOARD_SIZE, SHOOTER_SIZE } = Config;

setStyleConst([
  { name: "board-width", value: `${BOARD_SIZE.width}px` },
  { name: "board-height", value: `${BOARD_SIZE.height}px` },
  { name: "shooter-width", value: `${SHOOTER_SIZE.width}px` },
  { name: "shooter-height", value: `${SHOOTER_SIZE.height}px` },
  { name: "bullet-width", value: `${BULLET_SIZE.width}px` },
  { name: "bullet-height", value: `${BULLET_SIZE.height}px` },
]);
