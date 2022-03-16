import {
  getPointer,
  keyMap,
  keyPressed,
  offPointer,
  onPointer,
  TileEngine,
} from 'kontra';

export class EditorControls {
  scale: number;
  isAltDragging = false;
  altDragStartPos = { x: 0, y: 0 };
  currTileEngineSx = 0;
  currTileEngineSy = 0;
  maxSx = 0; // number of mapwidth pixels not inside the canvas
  maxSy = 0; // number of mapheight pixels not inside the canvas
  constructor(
    private canvas: HTMLCanvasElement,
    private tileEngine: TileEngine,
    { scale }
  ) {
    this.scale = scale;
    this.extendKeys();
    onPointer('down', this.onPointerDown);
    onPointer('up', this.onPointerUp);
    this.setMaxSxSy({
      mapwidth: this.tileEngine.mapwidth,
      mapheight: this.tileEngine.mapheight,
    });
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
  update() {
    this.checkMousePointer();
  }
  extendKeys() {
    keyMap['AltLeft'] = 'alt';
  }
  cleanup() {
    offPointer('down');
    offPointer('up');
  }
}
