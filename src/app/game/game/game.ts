import {
  init,
  GameLoop,
  initKeys,
  initPointer,
  load,
  TileEngine,
  emit,
  onKey,
} from 'kontra';
import { GameEvent } from './gameEvent';
import { IGameObject } from './iGameObject';
import { Player } from './player';

export class Game {
  canvas: HTMLCanvasElement;
  gos: IGameObject[] = [];
  loop: GameLoop;
  tileEngine: TileEngine;
  ctx: CanvasRenderingContext2D;
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
      this.initKeyBindings();
      canvas.height = tileEngine.mapheight * this.scale;
      canvas.width = tileEngine.mapwidth * this.scale;
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.tileEngine = tileEngine;
      this.loop = GameLoop({
        update: (dt: number) => {
          this.gos.forEach((go: any) => {
            go.update(dt);
          });
        },
        render: () => {
          this.gos.forEach((go: any) => {
            go.render();
          });
          this.tileEngine.render();
        },
      });
      this.addPlayer();
      this.loop.start(); // start the game
    });
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

  addPlayer() {
    this.gos.push(
      new Player(this, {
        scale: this.scale,
        color: '#af7F1E',
        isAi: false,
        spaceShipRenderIndex: 1,
        playerId: 1,
        x: 50,
        y: 50,
      })
    );
  }

  initKeyBindings() {
    onKey(
      'space',
      (e) => {
        emit(GameEvent.startGame, {});
        emit(GameEvent.startTrace, {});
      },
      { handler: 'keyup' }
    );
  }
}
