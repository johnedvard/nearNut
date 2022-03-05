import {
  init,
  GameLoop,
  initKeys,
  initPointer,
  load,
  TileEngine,
  emit,
  onKey,
  on,
} from 'kontra';
import { GameEvent } from './gameEvent';
import { GameState } from './gameState';
import { Goal } from './goal';
import { IGameObject } from './iGameObject';
import { Player } from './player';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';

export class Game {
  private gameState: GameState = GameState.loading;
  canvas: HTMLCanvasElement;
  gos: IGameObject[] = [];
  loop: GameLoop;
  tileEngine: TileEngine;
  ctx: CanvasRenderingContext2D;
  player: Player;
  goal: Goal;
  scale = 1;
  /**
   * The game only cares about one level at a time.
   * Load level, create game objects
   * @param id canvas ID
   */
  constructor(id: string = 'game', levelName: string = '001') {
    const { canvas } = init(id);
    initKeys();
    initPointer();
    this.loadLevel(levelName).then((tileEngine) => {
      this.setGameState(GameState.ready);
      this.initPlayer();
      this.initGoal();
      this.initKeyBindings();
      canvas.height = tileEngine.mapheight * this.scale;
      canvas.width = tileEngine.mapwidth * this.scale;
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.tileEngine = tileEngine;
      this.loop = GameLoop({
        update: (dt: number) => {
          this.player.update(dt);
          this.goal.update(dt);
          this.gos.forEach((go: any) => {
            go.update(dt);
          });
          this.checkTileMapCollision(this.player);
        },
        render: () => {
          this.player.render();
          this.goal.render();
          this.gos.forEach((go: any) => {
            go.render();
          });
          this.tileEngine.render();
        },
      });
      this.loop.start();
    });
    on(GameEvent.startGame, () => this.onStartGame());
    on(GameEvent.playerStateChange, (evt) => this.onPlayerStateChange(evt));
  }

  onStartGame() {
    this.setGameState(GameState.inProgress);
    emit(GameEvent.startTrace, {});
  }

  onPlayerStateChange(evt: PlayerStateChangeEvent) {
    if (evt?.state === PlayerState.dead) {
      this.setGameState(GameState.gameOver);
    }
  }

  checkTileMapCollision(go: IGameObject) {
    if (this.tileEngine) {
      const isCollision = this.tileEngine.layerCollidesWith(
        'ground',
        go.sprite
      );
      if (isCollision) {
        emit(GameEvent.hitWall, { go });
      }
    }
  }
  resetGame() {
    this.initPlayer();
    this.setGameState(GameState.ready);
  }
  loadLevel(levelName: string): Promise<TileEngine> {
    return load(
      'assets/tilesets/tileset_32x32_default.png',
      'assets/levels/001.json'
    ).then((assets) => {
      // can also use dataAssets (stores all kontra assets)
      assets[1].tilesets = [{ image: assets[0], firstgid: 1 }];
      const tileEngine = TileEngine({ ...assets[1] });
      return tileEngine;
    });
  }

  initPlayer() {
    this.player = new Player(this, {
      scale: this.scale,
      color: '#af7F1E',
      isAi: false,
      spaceShipRenderIndex: 1,
      playerId: 1,
      x: 50,
      y: 50,
    });
  }

  initGoal() {
    this.goal = new Goal();
  }
  startGame() {
    switch (this.gameState) {
      case GameState.ready:
        emit(GameEvent.startGame, {});
        break;
      case GameState.gameOver:
        this.resetGame();
        break;
    }
  }

  setGameState(state) {
    this.gameState = state;
    emit(GameEvent.gameStateChange, { state });
  }

  initKeyBindings() {
    onKey(
      'space',
      (e) => {
        this.startGame();
      },
      { handler: 'keyup' }
    );
  }
}
