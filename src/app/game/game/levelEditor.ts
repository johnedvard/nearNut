import {
  GameLoop,
  getPointer,
  init,
  initKeys,
  initPointer,
  keyMap,
  keyPressed,
  offPointer,
  onPointer,
  TileEngine,
} from 'kontra';
import { createGameObject } from './gameObjectFactory';
import { loadLevelFromObject } from './gameUtils';
import { IGameObject } from './iGameObject';
import { ILevelData } from './iLevelData';

export class LevelEditor {
  isAltDragging = false;
  altDragStartPos = 0;
  currTileEngineSx = 0;
  scale = 2 * window.devicePixelRatio;
  gos: IGameObject[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileEngine: TileEngine;
  maxSx = 0; // number of mapwidth pixels not inside the canvas
  maxSy = 0; // number of mapheight pixels not inside the canvas
  constructor(level: ILevelData) {
    const id = 'game';
    const { canvas } = init(id);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    initKeys();
    initPointer();
    this.extendKeys();
    if (level) {
      loadLevelFromObject(level).then(({ tileEngine, gameObjects }) => {
        this.initEditorLoop({ tileEngine, gameObjects });
      });
    }
    onPointer('down', this.onPointerDown);
    onPointer('up', this.onPointerUp);
  }

  onPointerUp = (e, obejct) => {
    this.isAltDragging = false;
  };

  onPointerDown = (e, object) => {
    console.log(e);
    if (keyPressed('alt')) {
      // TODO (johnedvard) Move dragging functinoality to another class/file
      this.currTileEngineSx = this.tileEngine.sx;
      this.altDragStartPos = e.offsetX;
      this.isAltDragging = true;
    }
  };

  cleanup() {
    this.gos.forEach((go) => go.cleanup());
    offPointer('down');
    offPointer('up');
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
    const mapheight = tileEngine.mapheight * this.scale;
    const mapwidth = tileEngine.mapwidth * this.scale;
    // hack to fake tilengine width and height, making it possible to move the camera
    tileEngine.mapwidth = mapwidth;
    tileEngine.mapheight = mapheight;
    this.canvas.height = mapheight;
    this.canvas.width = mapwidth - tileEngine.tilewidth * 3 * this.scale;
    this.ctx.scale(this.scale, this.scale);
    this.maxSx = (mapwidth - this.canvas.width) / this.scale;
    this.maxSy = (mapheight - this.canvas.height) / this.scale;

    for (const key in gameObjects) {
      if (gameObjects.hasOwnProperty(key)) {
        const gmaeObj = createGameObject(key, { ...gameObjects[key] });
        this.gos.push(gmaeObj);

        tileEngine.add(gmaeObj);
      }
    }

    const loop = GameLoop({
      update: (dt: number) => {
        this.gos.forEach((go) => {
          go.update(dt);
        });
        this.checkMousePointer();
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
  checkMousePointer() {
    if (this.isAltDragging) {
      const p = getPointer();
      const sx = this.currTileEngineSx + (p.x - this.altDragStartPos) * -1;

      if (sx <= 0) {
        this.tileEngine.sx = 0;
      } else if (sx >= this.maxSx) {
        this.tileEngine.sx = this.maxSx;
      } else {
        this.tileEngine.sx = sx;
      }
      getPointer();
    }
  }
  extendKeys() {
    keyMap['AltLeft'] = 'alt';
  }
}
