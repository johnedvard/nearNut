import {
  getPointer,
  offPointer,
  on,
  onPointer,
  TileEngine,
  track,
  untrack,
} from 'kontra';
import { EditorEvent } from './editorEvent';
import { EditorTile } from './editorTile';
import { getCol, getMaxSxSy, getRow } from './gameUtils';
import { IGameObject } from './iGameObject';

type PointerState = 'panning' | 'idle' | 'drawing' | 'erasing';
type Tool = 'block';
type Brush = 'main';
export class EditorControls {
  DELETE_TILE = 0;
  PRIMARY_BUTTON = 0;
  AUXILIARY_BUTTON = 1;
  SECONDARY_BUTTON = 2;
  BACK_BUTTON = 3;
  FORWARD_BUTTON = 4;
  scale: number;
  pointerState: PointerState = 'panning';
  selectedTool: Tool = 'block';
  selectedTile = this.DELETE_TILE;
  selectedBrush: Brush = 'main';
  altDragStartPos = { x: 0, y: 0 };
  currTileEngineSx = 0;
  currTileEngineSy = 0;
  maxSx = 0; // number of mapwidth pixels not inside the canvas
  maxSy = 0; // number of mapheight pixels not inside the canvas
  currCol = 0;
  currRow = 0;
  gos: IGameObject[] = [];

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
    on(EditorEvent.selectTile, this.onSelectTile);
  }

  onSelectTile = ({ tile }) => {
    this.setSelectedTile(tile);
  };
  setSelectedTile(tile: number) {
    // tile 17 is a transparent tile, use it the same as the delete tile
    if (tile === 17) tile = this.DELETE_TILE;
    if (tile === 14) tile = this.DELETE_TILE;
    this.selectedTile = tile;
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
        this.drawTile(this.selectedTile);
        break;
    }
  }
  /**
   * Also draws adjecent tiles
   */
  drawTile(tileToDraw) {
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
    this.currCol = col;
    this.currRow = row;

    // TODO (johnedvard) Expand tilemap if out of bounds
    const adjacentTiles = this.getAdjecentTiles({ col, row, layerName });
    if (tileToDraw === this.DELETE_TILE) {
      this.tileEngine.setTileAtLayer(layerName, { col, row }, 14); // the "empty" tile
    }
    // Need to set timout to draw two times in case of delete tile
    setTimeout(() => {
      this.tileEngine.setTileAtLayer(layerName, { col, row }, tileToDraw);
    });
  }
  getAdjecentTiles({ col, row, layerName }): EditorTile[] {
    const nwCoord = { row: row - 1, col: col - 1 };
    const nCoord = { row: row - 1, col };
    const neCoord = { row: row - 1, col: col + 1 };
    const eCoord = { row, col: col + 1 };
    const seCoord = { row: row + 1, col: col + 1 };
    const sCoord = { row: row + 1, col };
    const swCoord = { row: row + 1, col: col - 1 };
    const wCoord = { row, col: col - 1 };
    return [
      new EditorTile(layerName, nwCoord.col, nwCoord.row, this.tileEngine),
      new EditorTile(layerName, nCoord.col, nCoord.row, this.tileEngine),
      new EditorTile(layerName, neCoord.col, neCoord.row, this.tileEngine),
      new EditorTile(layerName, eCoord.col, eCoord.row, this.tileEngine),
      new EditorTile(layerName, seCoord.col, seCoord.row, this.tileEngine),
      new EditorTile(layerName, sCoord.col, sCoord.row, this.tileEngine),
      new EditorTile(layerName, swCoord.col, swCoord.row, this.tileEngine),
      new EditorTile(layerName, wCoord.col, wCoord.row, this.tileEngine),
    ];
  }

  erase() {
    this.drawTile(this.DELETE_TILE);
  }

  onPointerUp = (e) => {
    this.setPointerState('idle');
  };

  onPointerDown = (e) => {
    this.checkPointerDownObjects(e);

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

  /** takes sx and scale into account when checking for object */
  checkPointerDownObjects(e) {
    this.gos.forEach((go) => {
      if (
        e.offsetX + this.tileEngine.sx <
          go.sprite.x * this.scale + go.sprite.width &&
        e.offsetX + this.tileEngine.sx >
          go.sprite.x * this.scale - go.sprite.width &&
        e.offsetY + this.tileEngine.sy <
          go.sprite.y * this.scale + go.sprite.height &&
        e.offsetY + this.tileEngine.sy >
          go.sprite.y * this.scale - go.sprite.height
      ) {
        console.log('found object', go);
      }
    });
  }

  setMaxSxSy({ mapwidth, mapheight }) {
    const { maxSx, maxSy } = getMaxSxSy({
      mapwidth,
      mapheight,
      canvas: this.canvas,
      scale: this.scale,
    });
    this.maxSx = maxSx;
    this.maxSy = maxSy;
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

  addGameObject(gameObj: IGameObject) {
    this.gos.push(gameObj);
  }

  cleanup() {
    this.gos.length = 0;
    offPointer('down');
    offPointer('up');
  }
}
