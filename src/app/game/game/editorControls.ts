import { getPointer, offPointer, onPointer, TileEngine } from 'kontra';
import { getCol, getRow } from './gameUtils';
type PointerState = 'panning' | 'idle' | 'drawing' | 'erasing';
type Tool = 'block';
type Brush = 'main';
export class EditorControls {
  PRIMARY_BUTTON = 0;
  AUXILIARY_BUTTON = 1;
  SECONDARY_BUTTON = 2;
  BACK_BUTTON = 3;
  FORWARD_BUTTON = 4;
  scale: number;
  pointerState: PointerState = 'panning';
  selectedTool: Tool = 'block';
  selectedBrush: Brush = 'main';
  altDragStartPos = { x: 0, y: 0 };
  currTileEngineSx = 0;
  currTileEngineSy = 0;
  maxSx = 0; // number of mapwidth pixels not inside the canvas
  maxSy = 0; // number of mapheight pixels not inside the canvas

  currCol = 0;
  currRow = 0;
  constructor(
    private canvas: HTMLCanvasElement,
    private tileEngine: TileEngine,
    { scale }
  ) {
    this.scale = scale;
    onPointer('down', this.onPointerDown);
    onPointer('up', this.onPointerUp);
    this.setMaxSxSy({
      mapwidth: this.tileEngine.mapwidth,
      mapheight: this.tileEngine.mapheight,
    });
  }

  update() {
    switch (this.pointerState) {
      case 'panning':
        this.doPanning();
        break;
      case 'drawing':
        this.draw();
        break;
      case 'erasing':
        this.erase();
        break;
      default:
    }
  }
  draw() {
    switch (this.selectedBrush) {
      case 'main':
        this.drawTile();
        break;
    }
  }
  /**
   * Also draws adjecent tiles
   */
  drawTile() {
    const layerName = 'ground';
    const p = getPointer();
    const row = getRow(
      p.y,
      this.tileEngine.tileheight,
      this.scale,
      this.tileEngine.sy
    );
    const col = getCol(
      p.x,
      this.tileEngine.tilewidth,
      this.scale,
      this.tileEngine.sx
    );
    if (this.currCol !== col || this.currRow != row) {
      this.currCol = col;
      this.currRow = row;

      // TODO (johnedvard) Expand tilemap if out of bounds
      // Check neighbours and draw correct tile
      const adjacentTiles = this.getAdjecentTiles({ layerName, col, row });
      console.log(adjacentTiles);
      // No need to shrink map while editing

      // const aTile = this.tileEngine.tileAtLayer(layerName, { x, y });
      // this.tileEngine.setTileAtLayer(layerName, { col, row }, tile);

      // console.log(this.tileEngine);
      // console.log(aTile);
    }
  }
  getAdjecentTiles({ col, row, layerName }) {
    const tileAt = ({ row, col }) =>
      this.tileEngine.tileAtLayer(layerName, { row, col });
    return {
      nw: tileAt({ row: row - 1, col: col - 1 }),
      n: tileAt({ row: row - 1, col }),
      ne: tileAt({ row: row - 1, col: col + 1 }),
      e: tileAt({ row, col: col + 1 }),
      se: tileAt({ row: row + 1, col: col + 1 }),
      s: tileAt({ row: row + 1, col }),
      sw: tileAt({ row: row + 1, col: col - 1 }),
      w: tileAt({ row, col: col - 1 }),
    };
  }
  erase() {}

  onPointerUp = (e, obejct) => {
    this.setPointerState('idle');
  };

  onPointerDown = (e, object) => {
    console.log(e);
    if (e.altKey && e.button === this.PRIMARY_BUTTON) {
      this.setPointerState('panning');
      this.currTileEngineSx = this.tileEngine.sx;
      this.currTileEngineSy = this.tileEngine.sy;
      this.altDragStartPos = { x: e.offsetX, y: e.offsetY };
    } else if (e.button === this.PRIMARY_BUTTON) {
      this.setPointerState('drawing');
    } else if (e.button === this.SECONDARY_BUTTON) {
      this.setPointerState('erasing');
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

  setPointerState(state: PointerState) {
    this.pointerState = state;
  }

  doPanning() {
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

  cleanup() {
    offPointer('down');
    offPointer('up');
  }
}
