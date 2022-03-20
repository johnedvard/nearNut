import {
  init,
  GameLoop,
  initKeys,
  initPointer,
  TileEngine,
  emit,
  onKey,
  on,
  off,
  GameObject,
  getWorldRect,
} from 'kontra';
import { GameEvent } from './gameEvent';
import { GameState } from './gameState';
import {
  getCol,
  getMaxSxSy,
  getRow,
  loadLevelFromFile,
  loadLevelFromObject,
  rectCollision,
} from './gameUtils';
import { Goal } from './goal';
import { GoalSwitch } from './goalSwitch';
import { IGameObject } from './iGameObject';
import { ILevelData } from './iLevelData';
import { GameObjects } from './gameObjects';
import { Player } from './player';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';
import { gameHeight, gameWidth } from './gameSettings';

export class Game {
  private state: GameState = GameState.loading;
  scale = 2;
  canvas: HTMLCanvasElement;
  gameObjects: GameObjects;
  gos: IGameObject[] = [];
  loop: GameLoop;
  tileEngine: TileEngine;
  ctx: CanvasRenderingContext2D;
  player: Player;
  goal: Goal;
  goalSwitch: GoalSwitch;
  maxSx = 0;
  maxSy = 0;
  constructor();
  constructor(level: ILevelData);
  /**
   * The game only cares about one level at a time.
   * Load level, create game objects
   * @param id canvas ID
   */
  constructor(idOrLevel?: string | ILevelData, levelName: string = '001') {
    const id = 'game';
    const { canvas } = init(id);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    initKeys();
    initPointer();
    if (idOrLevel && (<ILevelData>idOrLevel).tilewidth) {
      loadLevelFromObject(<ILevelData>idOrLevel).then(
        ({ tileEngine, gameObjects }) => {
          this.initGameLoop({ tileEngine, gameObjects });
        }
      );
    } else {
      loadLevelFromFile(levelName).then(({ tileEngine, gameObjects }) => {
        this.initGameLoop({ tileEngine, gameObjects });
      });
    }

    on(GameEvent.startGame, this.onStartGame);
    on(GameEvent.playerStateChange, this.onPlayerStateChange);
    on(GameEvent.levelComplete, this.onLevelComplete);
  }

  cleanup() {
    off(GameEvent.startGame, this.onStartGame);
    off(GameEvent.playerStateChange, this.onPlayerStateChange);
    off(GameEvent.levelComplete, this.onLevelComplete);
    this.player.cleanup();
    this.goal.cleanup();
    this.goalSwitch.cleanup();
    this.gos.forEach((go) => go.cleanup());
  }

  initGameLoop({ tileEngine, gameObjects }) {
    const scale = this.scale;
    this.gameObjects = gameObjects;
    this.setState(GameState.ready);
    this.initGame(gameObjects);
    this.initKeyBindings();
    this.tileEngine = tileEngine;
    const mapheight = gameHeight;
    const mapwidth = gameWidth;
    this.canvas.height = mapheight;
    this.canvas.width = mapwidth;
    // hack to fake tilengine width and height, making it possible to move the camera
    tileEngine.mapwidth = tileEngine.width * tileEngine.tilewidth * scale;
    tileEngine.mapheight = tileEngine.height * tileEngine.tileheight * scale;
    const { maxSx, maxSy } = getMaxSxSy({
      mapwidth: tileEngine.mapwidth,
      mapheight: tileEngine.mapheight,
      canvas: this.canvas,
      scale: this.scale,
    });
    this.maxSx = maxSx;
    this.maxSy = maxSy;
    this.ctx.scale(this.scale, this.scale);
    this.tileEngine.add(this.goal);
    this.tileEngine.add(this.goalSwitch);
    this.tileEngine.add(this.player);

    this.loop = GameLoop({
      update: (dt: number) => {
        this.player.update(dt);
        this.goal.update(dt);
        if (this.player.sprite.x - this.tileEngine.sx > 100) {
          let sx = this.tileEngine.sx + 1;
          if (sx >= this.maxSx) {
            sx = this.maxSx - 1;
          }
          this.tileEngine.sx = sx;
        }
        this.goalSwitch.update(dt);
        this.gos.forEach((go: any) => {
          go.update(dt);
        });
        this.checkTileMapCollision(this.player);
        this.checkGoalSwitchColllision(this.player);
        this.checkGoalCollision(this.player);
      },
      render: () => {
        if (this.ctx.imageSmoothingEnabled) {
          this.ctx.imageSmoothingEnabled = false;
        }
        if (this.tileEngine) {
          this.tileEngine.render();
        }
        this.gos.forEach((go: any) => {
          go.render();
        });
      },
    });
    this.loop.start();
  }
  initGame(gameObjects: GameObjects) {
    if (this.tileEngine) {
      this.tileEngine.remove(this.goal);
      this.tileEngine.remove(this.goalSwitch);
      this.tileEngine.remove(this.player);
    }
    this.initPlayer(gameObjects.player);
    this.initGoal(gameObjects.goal);
    this.initGoalSwitch(gameObjects.goalSwitch);
    if (this.tileEngine) {
      this.tileEngine.add(this.goal);
      this.tileEngine.add(this.goalSwitch);
      this.tileEngine.add(this.player);
    }
    console.log(this.tileEngine);
  }

  onLevelComplete = () => {
    console.log('level complete');
    this.setState(GameState.gameOver);
    this.resetGame();
    // TODO (johnedvard)
    // save state
    // go to level selector? Go to next level?
  };
  onStartGame = () => {
    this.setState(GameState.inProgress);
    emit(GameEvent.startTrace, {});
  };

  onPlayerStateChange = (evt: PlayerStateChangeEvent) => {
    if (evt?.state === PlayerState.dead) {
      this.setState(GameState.gameOver);
    }
  };

  checkTileMapCollision(go: IGameObject) {
    if (this.tileEngine && go.sprite) {
      const isCollision = this.tileEngine.layerCollidesWith(
        'ground',
        go.sprite
      );
      if (isCollision) {
        const tile = this.tileEngine.tileAtLayer('ground', { ...go.sprite });
        const isTileCollision = this.checkTileCollision(go, tile);
        if (isTileCollision) {
          emit(GameEvent.hitWall, { go });
        }
      }
    }
  }
  checkTileCollision(go: IGameObject, tile: number): boolean {
    if (tile && (tile === 14 || tile === 17 || tile === 0)) {
      return false;
    }
    return true;
  }

  checkGoalSwitchColllision(go: IGameObject) {
    if (this.goalSwitch && go.sprite) {
      if (rectCollision(this.goalSwitch.sprite, go.sprite)) {
        emit(GameEvent.goalSwitchCollision, { other: go });
      }
    }
  }

  checkGoalCollision(go: IGameObject) {
    if (this.goal && go.sprite) {
      if (rectCollision(this.goal.sprite, go.sprite)) {
        emit(GameEvent.goalCollision, { other: go });
      }
    }
  }

  resetGame() {
    this.initGame(this.gameObjects);
    this.setState(GameState.ready);
  }

  initPlayer({ x, y }) {
    this.player = new Player({
      color: '#00ff00',
      x: x,
      y: y,
    });
  }

  initGoal({ x, y }) {
    this.goal = new Goal({ x, y });
  }
  initGoalSwitch({ x, y }) {
    this.goalSwitch = new GoalSwitch({ x, y });
  }
  startGame() {
    switch (this.state) {
      case GameState.ready:
        emit(GameEvent.startGame, {});
        break;
      case GameState.gameOver:
        this.resetGame();
        break;
    }
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;
      emit(GameEvent.gameStateChange, { state });
    }
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
