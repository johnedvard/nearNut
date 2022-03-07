import { keyPressed, load, on, Sprite, SpriteSheet } from 'kontra';
import { Observable, Subject } from 'rxjs';
import { MonetizeEvent } from 'src/app/shared/monetizeEvent';

import { GameEvent } from './gameEvent';
import { GoalSwitchState } from './goalSwitchState';
import { IGameObject } from './iGameObject';
import { Player } from './player';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';
import { spaceShipRenderers } from './spaceShipRenderers';

export class SpaceShip implements IGameObject {
  ANIMATION_TRACING = 'tracing';
  sprite: Sprite;
  rightKey = 'right';
  leftKey = 'left';
  weaponKey = 'up';
  spaceshipIndex = 0;
  ships: any[] = [...spaceShipRenderers];
  rotating = false;
  isSubscriber = false;
  spaceShipSubject = new Subject<Sprite>();
  constructor(
    private playerState: PlayerState,
    props: {
      scale: number;
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
    const { x, y } = {
      x: props.spriteProps.x || 0,
      y: props.spriteProps.y || 0,
    };
    this.initSpaceShip({ x, y });
    on(GameEvent.playerStateChange, (evt: any) =>
      this.onPlayerStateChange(evt)
    );
    on(MonetizeEvent.progress, () => this.onMonetizeProgress());
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

  initSpaceShip({ x, y }) {
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
          [this.ANIMATION_TRACING]: {
            frames: '56..58',
            frameRate: 6,
          },
        },
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        anchor: { x: 0.5, y: 0.5 },
        animations: spriteSheet.animations,
        update: function (dt: number) {
          if (!this) return;
          this.currentAnimation.update(dt);
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
      this.spaceShipSubject.next(this.sprite);
    });
  }

  sprite$(): Observable<Sprite> {
    return this.spaceShipSubject.asObservable();
  }

  onMonetizeProgress() {
    this.isSubscriber = true;
  }

  onPlayerStateChange(evt: PlayerStateChangeEvent) {
    if (evt.ship === this) {
      this.playerState = evt.state;
    }
  }

  renderSpaceShip(sprite: Sprite, isSubscriber = false) {
    if (this.playerState !== PlayerState.dead) {
      spaceShipRenderers[this.spaceshipIndex](sprite, isSubscriber);
    }
  }
}
