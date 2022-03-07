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
import { rectCollision } from './gameUtils';
import { Goal } from './goal';
import { GoalSwitch } from './goalSwitch';
import { IGameObject } from './iGameObject';
import { LevelData } from './levelData';
import { Player } from './player';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';

export class Game {
  private state: GameState = GameState.loading;
  canvas: HTMLCanvasElement;
  levelData: LevelData;
  gos: IGameObject[] = [];
  loop: GameLoop;
  tileEngine: TileEngine;
  ctx: CanvasRenderingContext2D;
  player: Player;
  goal: Goal;
  goalSwitch: GoalSwitch;
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
    this.loadLevel(levelName).then(({ tileEngine, levelData }) => {
      this.levelData = levelData;
      this.setState(GameState.ready);
      this.initGame(levelData);
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
    });
    on(GameEvent.startGame, () => this.onStartGame());
    on(GameEvent.playerStateChange, (evt) => this.onPlayerStateChange(evt));
    on(GameEvent.levelComplete, () => this.onLevelComplete());
  }

  initGame(levelData: LevelData) {
    this.initPlayer(levelData.gameObjects.player);
    this.initGoal(levelData.gameObjects.goal);
    this.initGoalSwitch(levelData.gameObjects.goalSwitch);
  }

  onLevelComplete() {
    console.log('level complete');
    this.setState(GameState.gameOver);

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
    this.initGame(this.levelData);
    this.setState(GameState.ready);
  }
  loadLevel(
    levelName: string
  ): Promise<{ tileEngine: TileEngine; levelData: LevelData }> {
    return load(
      'assets/tilesets/tileset_32x32_default.png',
      'assets/levels/001.json'
    ).then((assets) => {
      // can also use dataAssets (stores all kontra assets)
      assets[1].tilesets = [{ image: assets[0], firstgid: 1 }];
      const tileEngine = TileEngine({ ...assets[1] });
      return { tileEngine, levelData: assets[1] };
    });
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
