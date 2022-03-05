import { keyPressed, on, Sprite } from 'kontra';
import { MonetizeEvent } from 'src/app/shared/monetizeEvent';

import { GameEvent } from './gameEvent';
import { PlayerState } from './playerState';
import { spaceShipRenderers } from './spaceShipRenderers';

export class SpaceShip {
  sprite: Sprite;
  rightKey = 'right';
  leftKey = 'left';
  weaponKey = 'up';
  spaceshipIndex = 0;
  ships: any[] = [...spaceShipRenderers];
  rotating = false;
  isSubscriber = false;
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
    const spaceShip = this;
    const rotationSpeed = 5;
    this.sprite = Sprite({
      x: props.spriteProps.x || 0,
      y: props.spriteProps.y || 0,
      color: props.spriteProps.color || '#000',
      width: 15 * props.scale,
      height: 10 * props.scale,
      dx: 0,
      anchor: { x: 0.1, y: 0.5 },
      rotation: -Math.PI / 2,
      render: function () {
        spaceShip.renderSpaceShip(this, spaceShip.isSubscriber);
      },
      update: function (dt: number) {
        if (!this) return;
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
    on(GameEvent.playerStateChange, (evt: any) =>
      this.onPlayerStateChange(evt)
    );
    on(MonetizeEvent.progress, () => this.onMonetizeProgress());
  }
  onMonetizeProgress() {
    this.isSubscriber = true;
  }

  onPlayerStateChange(evt: { state: PlayerState; ship: SpaceShip }) {
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
