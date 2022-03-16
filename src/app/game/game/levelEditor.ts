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
  altDragStartPos = { x: 0, y: 0 };
  currTileEngineSx = 0;
  currTileEngineSy = 0;
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
    if (keyPressed('alt')) {
      // TODO (johnedvard) Move dragging functinoality to another class/file
      this.currTileEngineSx = this.tileEngine.sx;
      this.currTileEngineSy = this.tileEngine.sy;
      this.altDragStartPos = { x: e.offsetX, y: e.offsetY };
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

  changeTilemapSize({ row, col }) {
    // TODO (johnedvard) make it possible to add columns above and left of canvas
    this.tileEngine.mapwidth += col * this.tileEngine.tilewidth * this.scale;
    this.tileEngine.mapheight += row * this.tileEngine.tileheight * this.scale;
    this.setMaxSxSy({
      mapwidth: this.tileEngine.mapwidth,
      mapheight: this.tileEngine.mapheight,
    });
  }

  setMaxSxSy({ mapwidth, mapheight }) {
    this.maxSx = Math.max(0, (mapwidth - this.canvas.width) / this.scale);
    this.maxSy = Math.max(0, (mapheight - this.canvas.height) / this.scale);
  }
  initEditorLoop({ tileEngine, gameObjects }) {
    this.tileEngine = tileEngine;
    const mapheight = tileEngine.mapheight * this.scale;
    const mapwidth = tileEngine.mapwidth * this.scale;
    // hack to fake tilengine width and height, making it possible to move the camera
    tileEngine.mapwidth = mapwidth;
    tileEngine.mapheight = mapheight;
    this.canvas.height = tileEngine.tileheight * 20 * this.scale;
    this.canvas.width = tileEngine.tilewidth * 20 * this.scale;
    this.ctx.scale(this.scale, this.scale);
    this.setMaxSxSy({ mapwidth, mapheight });

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
      const sx = this.currTileEngineSx + (p.x - this.altDragStartPos.x) * -1;
      const sy = this.currTileEngineSy + (p.y - this.altDragStartPos.y) * -1;
      this.panCamera({ sx, sy });
      if (sx >= this.maxSx) {
        this.changeTilemapSize({ row: 0, col: 1 });
      }
      if (sy >= this.maxSy) {
        this.changeTilemapSize({ row: 1, col: 0 });
      }
    }
  }
  panCamera({ sx, sy }) {
    const pan = (key: string, value: number, max: number) => {
      if (max === 0) return;
      if (value <= 0) {
        this.tileEngine[key] = 0;
      } else if (value >= max) {
        this.tileEngine[key] = max;
      } else {
        this.tileEngine[key] = value;
      }
    };
    pan('sy', sy, this.maxSy);
    pan('sx', sx, this.maxSx);
  }
  extendKeys() {
    keyMap['AltLeft'] = 'alt';
  }
}
