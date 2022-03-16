import { GameLoop, init, initKeys, initPointer, TileEngine } from 'kontra';
import { EditorControls } from './editorControls';
import { createGameObject } from './gameObjectFactory';
import { loadLevelFromObject } from './gameUtils';
import { IGameObject } from './iGameObject';
import { ILevelData } from './iLevelData';

export class LevelEditor {
  //scale = 2 * window.devicePixelRatio;
  scale = 2;
  gos: IGameObject[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileEngine: TileEngine;
  editorControls: EditorControls;
  constructor(level: ILevelData) {
    const id = 'game';
    const { canvas } = init(id);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    initKeys();
    initPointer();
    if (level) {
      loadLevelFromObject(level).then(({ tileEngine, gameObjects }) => {
        this.initEditorLoop({ tileEngine, gameObjects });
      });
    }
  }

  cleanup() {
    this.gos.forEach((go) => go.cleanup());
    this.editorControls.cleanup();
  }

  renderGrid({ tilewidth, tileheight, mapwidth, mapheight }) {
    const ctx = this.ctx;
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    const startCol =
      this.tileEngine.tilewidth -
      (this.tileEngine.sx % this.tileEngine.tilewidth);
    const startRow =
      this.tileEngine.tileheight -
      (this.tileEngine.sy % this.tileEngine.tileheight);
    for (let row = startRow; row <= mapheight; row += tileheight) {
      ctx.moveTo(0, row);
      ctx.lineTo(mapwidth, row);
    }
    for (let col = startCol; col <= mapwidth; col += tilewidth) {
      ctx.moveTo(col, 0);
      ctx.lineTo(col, mapheight);
    }
    ctx.stroke();
  }

  initEditorLoop({ tileEngine, gameObjects }) {
    this.tileEngine = tileEngine;
    const mapheight = 600;
    const mapwidth = 800;
    // hack to fake tilengine width and height, making it possible to move the camera
    tileEngine.mapwidth = mapwidth;
    tileEngine.mapheight = mapheight;
    this.canvas.height = 600;
    this.canvas.width = 800;
    this.ctx.scale(this.scale, this.scale);
    this.editorControls = new EditorControls(this.canvas, this.tileEngine, {
      scale: this.scale,
    });

    for (const key in gameObjects) {
      if (gameObjects.hasOwnProperty(key)) {
        const gameObj = createGameObject(key, { ...gameObjects[key] });
        this.gos.push(gameObj);
        tileEngine.add(gameObj);
      }
    }

    const loop = GameLoop({
      update: (dt: number) => {
        this.gos.forEach((go) => {
          go.update(dt);
        });
        this.editorControls.update();
      },
      render: () => {
        if (this.ctx.imageSmoothingEnabled) {
          this.ctx.imageSmoothingEnabled = false;
        }
        if (tileEngine) {
          tileEngine.render();
          // TODO (johndevard) Draw grid only once. No need to clear the rect of the grid all the time since it's static
          this.renderGrid({
            mapheight,
            mapwidth,
            tileheight: tileEngine.tileheight,
            tilewidth: tileEngine.tilewidth,
          });
        }
      },
    });
    loop.start();
  }
}
