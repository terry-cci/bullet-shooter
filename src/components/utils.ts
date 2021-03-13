export class Size {
  width: number;
  height: number;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
}

export class Vector {
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

export class Velocity extends Vector {
  public getDistance(dt: number) {
    const ratio = dt / 1000;
    return new Vector(this.x * ratio, this.y * ratio);
  }
}
