import { MonetizeEvent } from 'src/app/shared/monetizeEvent';

import { Game } from './game';
import { getPlayerControls, isOutOfBounds } from './gameUtils';
import { EngineParticleEffect } from './engineParticleEffect';
import { emit, on, Sprite, Vector } from 'kontra';
import { IGameObject } from './iGameObject';
import { PlayerState } from './playerState';
import { GameEvent } from './gameEvent';
import { SpaceShip } from './spaceShip';

class Player implements IGameObject {
  sprite: Sprite;
  spaceShip: SpaceShip;
  playerState: PlayerState = PlayerState.idle;
  speed: number;
  effect: EngineParticleEffect;
  rotating = false;
  constructor(
    private game: Game,
    private scale: number,
    private playerProps: {
      color: string;
      isAi: boolean;
      spaceShipRenderIndex: number;
      playerId: number;
    }
  ) {
    this.effect = new EngineParticleEffect();
    this.speed = 100 * this.scale;
    const spriteProps = {
      x: 0,
      y: 0,
      color: this.playerProps.color || '#000',
    };
    const [leftKey, rightKey] = getPlayerControls();
    this.spaceShip = new SpaceShip(this.game, this.playerState, {
      scale: this.scale,
      spriteProps,
      isPreview: false,
      rightKey,
      leftKey,
    });

    on(GameEvent.startTrace, () => this.onStartTrace());
    on(GameEvent.hitWall, (evt: any) => this.onHitWall(evt));
    on(GameEvent.gameOver, (evt: any) => this.onGameOver(evt));
    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.sprite = this.spaceShip.sprite;
  }
  update(dt: number): void {
    this.sprite.update(dt);
    this.updateEngineEffect(dt);
    this.wallCollision();
    this.updateDeadPlayer();
  }
  render(): void {
    this.sprite.render();
    this.effect.render();
    this.renderDeadPlayer();
  }

  onStartTrace() {
    this.sprite.dx = this.speed;
    this.sprite.dy = this.speed;
    this.setPlayerState(PlayerState.tracing);
  }

  onMonetizeProgress() {}

  onGameOver(props: { winner: Player }) {
    if (props.winner === this) {
      this.setPlayerState(PlayerState.idle);
    }
  }
  onHitWall({ point, go }: { point: Vector; go: Sprite }) {
    if (go === this.sprite) {
      this.setPlayerState(PlayerState.dead);
    }
  }

  wallCollision() {
    if (
      this.playerState === PlayerState.tracing &&
      isOutOfBounds(this.game, this.sprite)
    ) {
      const point: Vector = Vector(this.sprite.x, this.sprite.y);
      emit(GameEvent.hitWall, {
        point: point,
        go: this.sprite,
      });
    }
  }

  updateDeadPlayer() {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  }

  renderDeadPlayer() {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  }

  setPlayerState(state: PlayerState) {
    if (this.playerState !== state) {
      this.playerState = state;
      emit(GameEvent.playerStateChange, { state, ship: this.spaceShip });
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
    this.effect.sprite.x = this.sprite.x - 5;
    this.effect.sprite.y = this.sprite.y - 5;
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
}
export { Player };
