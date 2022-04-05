import { init, keyPressed, load, off, on, Sprite, SpriteSheet } from 'kontra';
import { Observable, Subject } from 'rxjs';
import { MonetizeEvent } from 'src/app/shared/monetizeEvent';
import { getMirrorCrystalSeries } from 'src/app/shared/nearUtil';

import { GameEvent } from './gameEvent';
import { IGameObject } from './iGameObject';
import { IGameOptions } from './iGameOptions';
import { PlayerAnimation } from './playerAnimation';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';
import { SwordWeapon } from './swordWeapon';
import { Weapon } from './weapon';

export class SpaceShip implements IGameObject {
  sprite: Sprite;
  rightKey = 'right';
  leftKey = 'left';
  spaceshipIndex = 0;
  rotating = false;
  isSubscriber = false;
  spaceShipSubject = new Subject<{ sprite: Sprite }>();
  weapon: Weapon;
  gameOptions: IGameOptions;
  constructor(
    private playerState: PlayerState,
    props: {
      spriteProps: any;
      isPreview: boolean;
      leftKey?: string;
      rightKey?: string;
      weaponKey?: string;
      gameOptions?: IGameOptions;
    }
  ) {
    this.gameOptions = props.gameOptions || {};
    this.rightKey = props.rightKey || this.rightKey;
    this.leftKey = props.leftKey || this.leftKey;
    this.weapon = new SwordWeapon();

    this.initSpaceShip(props.spriteProps);
    on(GameEvent.playerStateChange, this.onPlayerStateChange);
    on(MonetizeEvent.progress, this.onMonetizeProgress);
    on(GameEvent.selectCharacter, this.onSelectCharacter);
  }

  onSelectCharacter = ({ id }) => {
    this.gameOptions.characterId = id;
    this.initSpaceShip({ x: this.sprite.x, y: this.sprite.y, color: '' });
  };
  cleanup(): void {
    off(GameEvent.playerStateChange, this.onPlayerStateChange);
    off(MonetizeEvent.progress, this.onMonetizeProgress);
    this.weapon.cleanup();
  }

  setAnimation(animation: PlayerAnimation) {
    this.sprite.currentAnimation = this.sprite.animations[animation];
  }
  update(dt: number): void {
    if (this.sprite) {
      this.weapon.update(dt);
      this.sprite.update(dt);
    }
  }
  render(): void {
    if (this.sprite) {
      this.weapon.render();
      this.sprite.render();
    }
  }

  getSelectedSpriteSheet() {
    const mirrorCrystalIds = [getMirrorCrystalSeries()];
    const defaultSpriteSheet =
      'assets/platform_metroidvania/herochar sprites(new)/herochar_spritesheet(new).png';
    const mirrorCrystalSpriteSheet =
      'assets/mirror_crystals/mirrorcrystal_spritesheet(new).png';
    let spriteSheet = defaultSpriteSheet;
    if (this.gameOptions) {
      if (mirrorCrystalIds.includes(this.gameOptions.characterId)) {
        spriteSheet = mirrorCrystalSpriteSheet;
      }
    }
    return spriteSheet;
  }
  initSpaceShip({ x, y, color }) {
    const spaceShip = this;
    const rotationSpeed = 5;
    load(this.getSelectedSpriteSheet()).then((assets) => {
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
            frames: [0, 1, 2, 3, 4, 5, 6, 7, 15], // the 15th frame is transparent
            frameRate: 10,
          },
          [PlayerAnimation.attack]: {
            frames: '24..27',
            frameRate: 20,
          },
        },
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        height: 16,
        width: 16,
        anchor: { x: 0.5, y: 0.5 },
        animations: {
          ...spriteSheet.animations,
        },
        update: function (dt: number) {
          if (!this) return;
          this.currentAnimation.update(dt); // To draw animation
          this.rotation = this.rotation || 0;
          if (spaceShip.playerState !== PlayerState.attacking) {
            if (keyPressed(spaceShip.leftKey)) {
              this.rotation -= rotationSpeed * dt;
              spaceShip.rotating = true;
            } else if (keyPressed(spaceShip.rightKey)) {
              this.rotation += rotationSpeed * dt;
              spaceShip.rotating = true;
            } else {
              spaceShip.rotating = false;
            }
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
    this.playerState = evt.state;
    switch (this.playerState) {
      case PlayerState.dead:
        this.setAnimation(PlayerAnimation.dead);
        this.sprite.currentAnimation.loop = false;
        break;
      case PlayerState.tracing:
        this.setAnimation(PlayerAnimation.tracing);
        break;
      case PlayerState.attacking:
        this.setAnimation(PlayerAnimation.attack);
        this.weapon.attack({
          x: this.sprite.x,
          y: this.sprite.y,
          rotation: this.sprite.rotation,
        });
        this.sprite.currentAnimation.loop = true;
        this.sprite.currentAnimation.reset();
        this.sprite.currentAnimation.loop = false;
        break;
      default:
        this.setAnimation(PlayerAnimation.tracing);
    }
  };
  setContext(context: CanvasRenderingContext2D): void {
    this.sprite.context = context;
  }
}
