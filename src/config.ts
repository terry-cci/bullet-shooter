import { Size, Velocity } from "./components/utils";

const config = {
  TICK_INTERVAL: 16,
  BOARD_SIZE: new Size(400, 600),
  SHOOTER_SIZE: new Size(40, 40),
  BULLET_SIZE: new Size(8, 8),
  BULLET_SPEED: new Velocity(0, 450),
};

export default config;
