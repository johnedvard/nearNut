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
  scale: number;
  constructor(
    private game: Game,
    private playerProps: {
      scale: number;
      color: string;
      isAi: boolean;
      spaceShipRenderIndex: number;
      playerId: number;
      x: number;
      y: number;
    }
  ) {
    this.scale = this.playerProps.scale || 1;
    this.speed = 100 * this.scale;
    const spriteProps = {
      x: this.playerProps.x || 0,
      y: this.playerProps.y || 0,
      color: this.playerProps.color || '#000',
    };
    const [leftKey, rightKey] = getPlayerControls();
    this.spaceShip = new SpaceShip(this.playerState, {
      scale: this.scale,
      spriteProps,
      isPreview: false,
      rightKey,
      leftKey,
    });
    this.effect = new EngineParticleEffect();

    on(GameEvent.startTrace, () => this.onStartTrace());
    on(GameEvent.hitWall, (evt: any) => this.onHitWall(evt));
    on(GameEvent.gameOver, (evt: any) => this.onGameOver(evt));
    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.spaceShip.sprite$().subscribe((sprite) => {
      this.sprite = sprite;
    });
  }
  update(dt: number): void {
    if (this.sprite) {
      this.sprite.update(dt);
    }
    this.updateEngineEffect(dt);
    this.wallCollision();
    this.updateDeadPlayer();
  }
  render(): void {
    if (this.sprite) {
      this.sprite.render();
    }
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

  onHitWall({ go }: { go: IGameObject }) {
    if (go === this) {
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
}
export { Player };
