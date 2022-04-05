import { MonetizeEvent } from 'src/app/shared/monetizeEvent';

import { getPlayerControls } from './gameUtils';
import { EngineParticleEffect } from './engineParticleEffect';
import { emit, keyPressed, off, on, Sprite } from 'kontra';
import { IGameObject } from './iGameObject';
import { PlayerState } from './playerState';
import { GameEvent } from './gameEvent';
import { SpaceShip } from './spaceShip';
import { IGameOptions } from './iGameOptions';

class Player implements IGameObject {
  sprite: Sprite;
  dummy: Sprite;
  spaceShip: SpaceShip;
  playerState: PlayerState = PlayerState.idle;
  speed = 100;
  effect: EngineParticleEffect;
  rotating = false;
  prevState: PlayerState;
  currAnimationDuration = 0;
  currAnimationTimeLapsed = 0;
  constructor(
    private playerProps: {
      color: string;
      x: number;
      y: number;
      gameOptions?: IGameOptions;
    }
  ) {
    const spriteProps = {
      x: this.playerProps.x || 0,
      y: this.playerProps.y || 0,
      color: this.playerProps.color || '#fff',
    };
    const [leftKey, rightKey] = getPlayerControls();
    this.spaceShip = new SpaceShip(this.playerState, {
      spriteProps,
      isPreview: false,
      rightKey,
      leftKey,
      gameOptions: this.playerProps.gameOptions,
    });
    this.effect = new EngineParticleEffect();

    on(GameEvent.startTrace, this.onStartTrace);
    on(GameEvent.hitWall, this.onHitWall);
    on(GameEvent.gameOver, this.onGameOver);
    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.spaceShip.sprite$().subscribe(({ sprite }) => {
      this.sprite = sprite;
    });
  }

  cleanup(): void {
    off(GameEvent.startTrace, this.onStartTrace);
    off(GameEvent.hitWall, this.onHitWall);
    off(GameEvent.gameOver, this.onGameOver);
    off(MonetizeEvent.progress, this.onMonetizeProgress);
    this.setPlayerState(PlayerState.idle);
    this.spaceShip.cleanup();
  }

  update(dt: number): void {
    if (this.spaceShip) {
      this.spaceShip.update(dt);
    }
    if (
      this.playerState !== PlayerState.dead &&
      this.playerState !== PlayerState.idle
    ) {
      this.updateEngineEffect(dt);
    }
    this.updateStateAfterAnimation(dt);
    this.playerControls();
  }
  render(): void {
    if (this.spaceShip) {
      this.spaceShip.render();
    }
    if (
      this.playerState !== PlayerState.dead &&
      this.playerState !== PlayerState.idle
    ) {
      this.effect.render();
    }
  }

  updateStateAfterAnimation(dt: number) {
    if (this.currAnimationDuration) {
      this.currAnimationTimeLapsed += dt * 1000;
      if (this.currAnimationTimeLapsed >= this.currAnimationDuration) {
        this.currAnimationDuration = 0;
        this.currAnimationTimeLapsed = 0;
        this.setPlayerState(this.prevState);
      }
    }
  }
  playerControls() {
    if (keyPressed('space')) {
      if (this.playerState === PlayerState.tracing) {
        this.prevState = this.playerState;
        // TODO (johnedvard) calc animation duration based on framerate
        this.currAnimationDuration = 200;
        this.setPlayerState(PlayerState.attacking);

        // this.sprite.dx = attackSpeed;
        // this.sprite.dy = attackSpeed;
      }
    }
  }

  onStartTrace = () => {
    this.sprite.dx = this.speed;
    this.sprite.dy = this.speed;
    this.setPlayerState(PlayerState.tracing);
  };

  onMonetizeProgress() {}

  onGameOver = (props: { winner: Player }) => {
    if (props.winner === this) {
      this.setPlayerState(PlayerState.idle);
    }
  };

  onHitWall = ({ go }: { go: IGameObject }) => {
    if (go === this) {
      this.setPlayerState(PlayerState.dead);
    }
  };

  setPlayerState(state: PlayerState) {
    if (this.playerState !== state) {
      this.playerState = state;
      emit(GameEvent.playerStateChange, { state });
      if (
        this.playerState === PlayerState.dead ||
        this.playerState === PlayerState.idle
      ) {
        this.sprite.dx = 0;
        this.sprite.dy = 0;
      }
    }
  }

  updateEngineEffect(dt: number) {
    if (!this.sprite) return;
    this.effect.sprite.x = this.sprite.x - 4;
    this.effect.sprite.y = this.sprite.y - 4;
    this.effect.dx = this.sprite.dx;
    this.effect.dy = this.sprite.dy;
    this.effect.rotation = this.sprite.rotation;
    this.effect.sprite.color = this.sprite.color;
    this.effect.update(dt);
  }

  resetPlayer() {
    this.setPlayerState(PlayerState.idle);
  }

  setColor(color: string) {
    this.sprite.color = color;
    this.spaceShip.sprite.color = color;
  }
  setContext(context: CanvasRenderingContext2D): void {
    this.sprite.context = context;
  }
}
export { Player };
