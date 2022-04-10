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
  lerp,
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
import { Door } from './door';
import { DoorSwitch } from './doorSwitch';
import { IGameObject } from './iGameObject';
import { ILevelData } from './iLevelData';
import { ILevelGameObject } from './gameObjects';
import { Player } from './player';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';
import { gameHeight, gameWidth } from './gameSettings';
import { Goal } from './goal';
import { createGameObject } from './gameObjectFactory';
import { IGameOptions } from './iGameOptions';

export class Game {
  private state: GameState = GameState.loading;
  scale = 2;
  canvas: HTMLCanvasElement;
  gameObjects: ILevelGameObject[];
  gameOptions: IGameOptions;
  gos: IGameObject[] = [];
  loop: GameLoop;
  tileEngine: TileEngine;
  ctx: CanvasRenderingContext2D;
  player: Player;
  maxSx = 0;
  maxSy = 0;
  constructor();
  constructor(level: ILevelData, gameOptions?: IGameOptions);
  /**
   * The game only cares about one level at a time.
   * Load level, create game objects
   * @param id canvas ID
   */
  constructor(idOrLevel?: string | ILevelData, gameOptions?: IGameOptions) {
    const id = 'game';
    const { canvas } = init(id);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    initKeys();
    initPointer();
    if (idOrLevel && (<ILevelData>idOrLevel).tilewidth) {
      loadLevelFromObject(<ILevelData>idOrLevel).then(
        ({ tileEngine, gameObjects }) => {
          this.initGameLoop({ tileEngine, gameObjects, gameOptions });
        }
      );
    } else {
      loadLevelFromFile(<string>idOrLevel).then(
        ({ tileEngine, gameObjects }) => {
          this.initGameLoop({ tileEngine, gameObjects, gameOptions });
        }
      );
    }
  }

  cleanup() {
    off(GameEvent.startGame, this.onStartGame);
    off(GameEvent.playerStateChange, this.onPlayerStateChange);
    off(GameEvent.levelComplete, this.onLevelComplete);

    this.gos.forEach((go) => go.cleanup());
  }

  initGameLoop({ tileEngine, gameObjects, gameOptions }) {
    const scale = this.scale;
    this.gameObjects = gameObjects;
    this.gameOptions = gameOptions || {};
    this.setState(GameState.ready);
    this.initKeyBindings();
    this.tileEngine = tileEngine;
    const mapheight = gameHeight;
    const mapwidth = gameWidth;
    // hack to fake tilengine width and height, making it possible to move the camera
    tileEngine.mapwidth = tileEngine.width * tileEngine.tilewidth * scale;
    tileEngine.mapheight = tileEngine.height * tileEngine.tileheight * scale;
    this.canvas.height = Math.min(tileEngine.mapheight, mapheight);
    this.canvas.width = Math.min(tileEngine.mapwidth, mapwidth);
    const { maxSx, maxSy } = getMaxSxSy({
      mapwidth: tileEngine.mapwidth,
      mapheight: tileEngine.mapheight,
      canvas: this.canvas,
      scale: this.scale,
    });
    this.maxSx = maxSx;
    this.maxSy = maxSy;
    this.ctx.scale(this.scale, this.scale);

    this.initGame({ gameObjects, gameOptions });
    this.loop = GameLoop({
      update: (dt: number) => {
        this.gos.forEach((go: any) => {
          go.update(dt);
          if (go instanceof DoorSwitch) {
            this.checkDoorSwitchColllision(go, this.player);
          } else if (go instanceof Door) {
            this.checkDoorCollision(go, this.player);
          } else if (go instanceof Goal) {
            this.checkGoalCollision(go, this.player);
          }
        });
        this.checkTileMapCollision(this.player);
        this.checkCameraControls();
      },
      render: () => {
        if (this.ctx.imageSmoothingEnabled) {
          this.ctx.imageSmoothingEnabled = false;
        }
        if (this.tileEngine) {
          this.tileEngine.render();
        }
      },
    });
    this.loop.start();
  }
  initGame({ gameObjects, gameOptions }) {
    if (this.tileEngine) {
      this.gos.forEach((go) => {
        this.tileEngine.remove(go);
      });
      gameObjects.forEach((levelGo) => {
        const gameObj = createGameObject(levelGo.type, {
          ...levelGo,
          gameOptions,
        });
        if (gameObj instanceof Player) {
          this.player = gameObj;
        }
        this.gos.push(gameObj);
        this.tileEngine.add(gameObj);
      });
    }

    on(GameEvent.startGame, this.onStartGame);
    on(GameEvent.playerStateChange, this.onPlayerStateChange);
    on(GameEvent.levelComplete, this.onLevelComplete);
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
      const collisionBox = {
        x: go.sprite.x,
        y: go.sprite.y,
        width: 5,
        height: 5,
        anchor: go.sprite.anchor,
      };

      const isCollision = this.tileEngine.layerCollidesWith(
        'ground',
        collisionBox
      );
      if (isCollision) {
        const tile = this.tileEngine.tileAtLayer('ground', { ...collisionBox });
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

  checkDoorSwitchColllision(doorSwitch: DoorSwitch, go: IGameObject) {
    if (doorSwitch && go.sprite) {
      if (rectCollision(doorSwitch.sprite, go.sprite)) {
        emit(GameEvent.doorSwitchCollision, { self: doorSwitch, other: go });
      }
    }
  }

  checkDoorCollision(door: Door, go: IGameObject) {
    if (door && go.sprite) {
      if (rectCollision(door.sprite, go.sprite)) {
        emit(GameEvent.doorCollision, { other: go });
      }
    }
  }
  checkGoalCollision(goal: Goal, go: IGameObject) {
    if (goal && go.sprite) {
      if (rectCollision(goal.sprite, go.sprite)) {
        emit(GameEvent.goalCollision, { other: go });
      }
    }
  }

  resetGame() {
    this.cleanup();
    this.initGame({
      gameObjects: this.gameObjects,
      gameOptions: this.gameOptions,
    });
    this.setState(GameState.ready);
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

  checkCameraControls() {
    if (!this.player.sprite) return;
    const pan = (sxy, xy, max, cameraDiff) => {
      const maxDiff = 120;
      const minDiff = 100;
      let camPos = this.tileEngine[sxy];
      if (cameraDiff > maxDiff) {
        camPos = this.player.sprite[xy] - maxDiff;
      } else if (cameraDiff < minDiff) {
        camPos = this.player.sprite[xy] - minDiff;
      }
      if (camPos >= max) {
        camPos = max;
      } else if (camPos <= 0) {
        camPos = 0;
      }
      this.tileEngine[sxy] = lerp(this.tileEngine[sxy], camPos, 1);
    };
    const caneraDiffX = this.player.sprite.x - this.tileEngine.sx;
    const caneraDiffY = this.player.sprite.y - this.tileEngine.sy;

    pan('sx', 'x', this.maxSx, caneraDiffX);
    pan('sy', 'y', this.maxSy, caneraDiffY);
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
