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
import {
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

export class Game {
  private state: GameState = GameState.loading;
  canvas: HTMLCanvasElement;
  gameObjects: GameObjects;
  gos: IGameObject[] = [];
  loop: GameLoop;
  tileEngine: TileEngine;
  ctx: CanvasRenderingContext2D;
  player: Player;
  goal: Goal;
  goalSwitch: GoalSwitch;
  scale = 1;
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
    initKeys();
    initPointer();
    if (idOrLevel && (<ILevelData>idOrLevel).tilewidth) {
      loadLevelFromObject(<ILevelData>idOrLevel).then(
        ({ tileEngine, gameObjects }) => {
          this.initGameLoop({ tileEngine, gameObjects, canvas });
        }
      );
    } else {
      loadLevelFromFile(levelName).then(({ tileEngine, gameObjects }) => {
        this.initGameLoop({ tileEngine, gameObjects, canvas });
      });
    }

    on(GameEvent.startGame, () => this.onStartGame());
    on(GameEvent.playerStateChange, (evt) => this.onPlayerStateChange(evt));
    on(GameEvent.levelComplete, () => this.onLevelComplete());
  }

  initGameLoop({ tileEngine, gameObjects, canvas }) {
    this.gameObjects = gameObjects;
    this.setState(GameState.ready);
    this.initGame(gameObjects);
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
        this.goalSwitch.update(dt);
        this.gos.forEach((go: any) => {
          go.update(dt);
        });
        this.checkTileMapCollision(this.player);
        this.checkGoalSwitchColllision(this.player);
        this.checkGoalCollision(this.player);
      },
      render: () => {
        this.player.render();
        this.goal.render();
        this.goalSwitch.render();
        this.gos.forEach((go: any) => {
          go.render();
        });
        if (tileEngine) {
          this.tileEngine.render();
        }
      },
    });
    this.loop.start();
  }
  initGame(gameObjects: GameObjects) {
    this.initPlayer(gameObjects.player);
    this.initGoal(gameObjects.goal);
    this.initGoalSwitch(gameObjects.goalSwitch);
  }

  onLevelComplete() {
    console.log('level complete');
    this.setState(GameState.gameOver);
    this.resetGame();
    // TODO (johnedvard)
    // save state
    // go to level selector? Go to next level?
  }
  onStartGame() {
    this.setState(GameState.inProgress);
    emit(GameEvent.startTrace, {});
  }

  onPlayerStateChange(evt: PlayerStateChangeEvent) {
    if (evt?.state === PlayerState.dead) {
      this.setState(GameState.gameOver);
    }
  }

  checkTileMapCollision(go: IGameObject) {
    if (this.tileEngine && go.sprite) {
      const isCollision = this.tileEngine.layerCollidesWith(
        'ground',
        go.sprite
      );
      if (isCollision) {
        emit(GameEvent.hitWall, { go });
      }
    }
  }

  checkGoalSwitchColllision(go: IGameObject) {
    if (this.goalSwitch && go.sprite) {
      if (rectCollision(this.goalSwitch.sprite, go.sprite)) {
        emit(GameEvent.goalSwitchCollision, { other: go });
      }
    }
  }

  checkGoalCollision(go: IGameObject) {
    if (this.goalSwitch && go.sprite) {
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
    this.player = new Player(this, {
      scale: this.scale,
      color: '#00ff00',
      isAi: false,
      spaceShipRenderIndex: 1,
      playerId: 1,
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
