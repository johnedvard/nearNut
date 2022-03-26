import { init, keyPressed, load, off, on, Sprite, SpriteSheet } from 'kontra';
import { Observable, Subject } from 'rxjs';
import { MonetizeEvent } from 'src/app/shared/monetizeEvent';

import { GameEvent } from './gameEvent';
import { IGameObject } from './iGameObject';
import { PlayerAnimation } from './playerAnimation';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';
import { spaceShipRenderers } from './spaceShipRenderers';

export class SpaceShip implements IGameObject {
  sprite: Sprite;
  rightKey = 'right';
  leftKey = 'left';
  weaponKey = 'up';
  spaceshipIndex = 0;
  ships: any[] = [...spaceShipRenderers];
  rotating = false;
  isSubscriber = false;
  spaceShipSubject = new Subject<{ sprite: Sprite }>();
  constructor(
    private playerState: PlayerState,
    props: {
      spriteProps: any;
      isPreview: boolean;
      leftKey?: string;
      rightKey?: string;
      weaponKey?: string;
    }
  ) {
    this.rightKey = props.rightKey || this.rightKey;
    this.leftKey = props.leftKey || this.leftKey;
    this.weaponKey = props.weaponKey || this.weaponKey;

    this.initSpaceShip(props.spriteProps);
    on(GameEvent.playerStateChange, this.onPlayerStateChange);
    on(MonetizeEvent.progress, this.onMonetizeProgress);
  }

  cleanup(): void {
    off(GameEvent.playerStateChange, this.onPlayerStateChange);
    off(MonetizeEvent.progress, this.onMonetizeProgress);
  }

  setAnimation(animation: PlayerAnimation) {
    this.sprite.currentAnimation = this.sprite.animations[animation];
  }
  update(dt: number): void {
    if (this.sprite) {
      this.sprite.update(dt);
    }
  }
  render(): void {
    if (this.sprite) {
      this.sprite.render();
    }
  }

  initSpaceShip({ x, y, color }) {
    const spaceShip = this;
    const rotationSpeed = 5;
    load(
      'assets/platform_metroidvania/herochar sprites(new)/herochar_spritesheet(new).png'
    ).then((assets) => {
      const spriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 16,
        frameHeight: 16,
        animations: {
          [PlayerAnimation.tracing]: {
            frames: '56..58',
            frameRate: 6,
          },
          [PlayerAnimation.dead]: {
            frames: '0..7',
            frameRate: 10,
          },
          [PlayerAnimation.celebrate]: {},
        },
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        height: 16,
        width: 16,
        anchor: { x: 0.5, y: 0.5 },
        animations: spriteSheet.animations,
        update: function (dt: number) {
          if (!this) return;
          this.currentAnimation.update(dt); // To draw animation
          this.rotation = this.rotation || 0;
          if (keyPressed(spaceShip.leftKey)) {
            this.rotation -= rotationSpeed * dt;
            spaceShip.rotating = true;
          } else if (keyPressed(spaceShip.rightKey)) {
            this.rotation += rotationSpeed * dt;
            spaceShip.rotating = true;
          } else {
            spaceShip.rotating = false;
          }

          // move the ship forward in the direction it's facing
          this.x = this.x + this.dx * dt * Math.cos(this.rotation);
          this.y = this.y + this.dy * dt * Math.sin(this.rotation);
        },
      });

      this.spaceShipSubject.next({
        sprite: this.sprite,
      });
    });
  }

  sprite$(): Observable<{ sprite: Sprite }> {
    return this.spaceShipSubject.asObservable();
  }

  onMonetizeProgress = () => {
    this.isSubscriber = true;
  };

  onPlayerStateChange = (evt: PlayerStateChangeEvent) => {
    if (evt.ship === this) {
      this.playerState = evt.state;
      switch (this.playerState) {
        case PlayerState.dead:
          this.setAnimation(PlayerAnimation.dead);
          this.sprite.currentAnimation.loop = false;
          break;
        case PlayerState.tracing:
          this.setAnimation(PlayerAnimation.tracing);
          break;
        default:
          this.setAnimation(PlayerAnimation.tracing);
      }
    }
  };

  renderSpaceShip(sprite: Sprite, isSubscriber = false) {
    if (this.playerState !== PlayerState.dead) {
      spaceShipRenderers[this.spaceshipIndex](sprite, isSubscriber);
    }
  }
}
