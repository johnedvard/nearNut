import { Pool, Sprite } from 'kontra';
import { IGameObject } from './iGameObject';

function coneEffect(rotation) {
  return ((1 - Math.random() * 2) / 4) * Math.sign(Math.cos(rotation));
}

export class EngineParticleEffect implements IGameObject {
  sprite: Sprite;
  private pool: Pool;
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;
  rotation = 0;
  constructor() {
    this.pool = Pool({
      create: Sprite,
      maxSize: 100,
    });
    this.sprite = Sprite({
      x: 0,
      y: 0,
      update: (dt: number) => {
        this.updatePool(dt);
      },
      render: () => {
        this.pool.render();
      },
    });
  }
  cleanup(): void {}
  updatePool(dt: number) {
    const rotation = this.rotation;

    this.pool.get({
      color: this.sprite.color,
      ttl: 80,
      update: function (dt) {
        if (this.ttl > 0) {
          this.dx = -Math.cos(rotation) - coneEffect(rotation);
          this.dy = -Math.sin(rotation) + coneEffect(rotation);
          this.x = this.x + this.dx;
          this.y = this.y + this.dy;
          this.ttl = this.ttl - dt * 100;
        }
      },
      render: function () {
        this.context.globalAlpha = this.ttl / 300;
        this.context.fillStyle = this.color;
        this.context.strokeStyle = this.color;
        const size = Math.max(3, this.ttl / 10);
        this.context.fillRect(this.x, this.y, size, size);
      },
    });
    this.pool.update(dt);
  }
  render() {
    this.sprite.render();
  }
  update(dt: number): void {
    this.sprite.update(dt);
  }
}
