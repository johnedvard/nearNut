import {
  GameObject,
  getPointer,
  offPointer,
  onPointer,
  Sprite,
  TileEngine,
} from 'kontra';
import { Subscription } from 'rxjs';
import { EditorTile } from './editorTile';
import { createGameObject, getGameOjectType } from './gameObjectFactory';
import { GameObjectType } from './gameObjects';
import { getCol, getMaxSxSy, getRow, rectCollision } from './gameUtils';
import { IAngularServices } from './iAngularServices';
import { IGameObject } from './iGameObject';
import { ILevelData } from './iLevelData';
import { Tool } from './tool';

type PointerState = 'panning' | 'idle' | 'drawing' | 'erasing' | 'dragging';
type Brush = 'main';
export class EditorControls {
  DELETE_TILE = 0;
  PRIMARY_BUTTON = 0;
  AUXILIARY_BUTTON = 1;
  SECONDARY_BUTTON = 2;
  BACK_BUTTON = 3;
  FORWARD_BUTTON = 4;
  pointerState: PointerState = 'panning';
  selectedTool: Tool;
  selectedTile = this.DELETE_TILE;
  draggingObject: IGameObject;
  selectedBrush: Brush = 'main';
  altDragStartPos = { x: 0, y: 0 };
  currTileEngineSx = 0;
  currTileEngineSy = 0;
  currPointerStart = { x: 0, y: 0 };
  maxSx = 0; // number of mapwidth pixels not inside the canvas
  maxSy = 0; // number of mapheight pixels not inside the canvas
  currCol = 0;
  currRow = 0;
  subscriptions: Subscription[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private tileEngine: TileEngine,
    private level: ILevelData,
    private scale,
    private angularServices?: IAngularServices,
    private gos?: IGameObject[]
  ) {
    onPointer('down', this.onPointerDown);
    onPointer('up', this.onPointerUp);
    this.setMaxSxSy({
      mapwidth: this.tileEngine.mapwidth,
      mapheight: this.tileEngine.mapheight,
    });
    const tileSub = this.angularServices.editorService
      .getTileId()
      .subscribe((tile) => this.onSelectTile({ tile }));
    const toolSub = this.angularServices.editorService
      .getSelectedTool()
      .subscribe((tool) => {
        if (tool) {
          this.selectedTool = tool;
        }
      });
    this.subscriptions.push(...[tileSub, toolSub]);
  }

  onSelectTile = ({ tile }) => {
    console.log('tile id', tile);
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
      case 'dragging':
        this.doDragging();
        break;
      default:
    }
  }
  draw() {
    if (this.selectedTool && !this.selectedTool.isTileTool) {
      this.drawTool(this.selectedTool);
      return;
    }
    switch (this.selectedBrush) {
      case 'main':
        this.drawTile(this.selectedTile);
        return;
    }
  }

  drawTool(tool: Tool) {
    const p = getPointer();
    if (!this.isTileAvailable(p)) return;
    const { col, row } = this.getColRowPointer(p);
    const x = col * this.tileEngine.tilewidth + this.tileEngine.tilewidth / 2;
    const y = row * this.tileEngine.tileheight + this.tileEngine.tileheight / 2;
    const goClone = createGameObject(getGameOjectType(tool.go), {
      x,
      y,
    });
    // TODO add to level as well
    this.gos.push(goClone);
    this.tileEngine.add(goClone);
    this.level.gameObjects.push({
      x,
      y,
      id: goClone.id,
      type: getGameOjectType(tool.go),
    });
  }
  /**
   * Also draws adjecent tiles
   */
  drawTile(tileToDraw) {
    const { col, row } = this.setCurrColRow();
    const layerName = 'ground';

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
  isTileAvailable(p): boolean {
    let isAvailable = true;
    const { col, row } = this.getColRowPointer(p);
    this.gos.forEach((go) => {
      const goCoord = this.getColRowGo(go.sprite);
      if (col === goCoord.col && row === goCoord.row) {
        isAvailable = false;
        return;
      }
    });
    return isAvailable;
  }
  setCurrColRow() {
    const p = getPointer();
    const { col, row } = this.getColRowPointer(p);
    this.currCol = col;
    this.currRow = row;
    return { col, row };
  }
  getColRowPointer(p): { col: number; row: number } {
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
    return { col, row };
  }
  getColRowGo(go: GameObject): { col: number; row: number } {
    if (!go) return { col: -1, row: -1 };
    const row = getRow(go.y, this.tileEngine.tileheight, 1, 0);
    const col = getCol(go.x, this.tileEngine.tilewidth, 1, 0);
    return { col, row };
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

    if (this.draggingObject) {
      this.updateLevelData(this.draggingObject);
      this.draggingObject = null;
    }
  };

  updateLevelData(go: IGameObject) {
    const levelGo = this.level.gameObjects.find((levGo) => levGo.id === go.id);
    if (!levelGo) throw new Error('Object not found in level: ' + go.id);
    levelGo.y = go.sprite.y;
    levelGo.x = go.sprite.x;
  }

  onPointerDown = (e) => {
    if (e.altKey && e.button === this.PRIMARY_BUTTON) {
      this.setPointerState('panning');
      this.currTileEngineSx = this.tileEngine.sx;
      this.currTileEngineSy = this.tileEngine.sy;
      this.altDragStartPos = { x: e.offsetX, y: e.offsetY };
    } else if (this.checkPointerDownObjects(e)) {
      this.setPointerState('dragging');
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

  /** takes sx, sy and scale into account when checking for object */
  checkPointerDownObjects(e): boolean {
    this.gos.forEach((go) => {
      if (
        e.offsetX + this.tileEngine.sx * this.scale <
          go.sprite.x * this.scale + go.sprite.width &&
        e.offsetX + this.tileEngine.sx * this.scale >
          go.sprite.x * this.scale - go.sprite.width &&
        e.offsetY + this.tileEngine.sy * this.scale <
          go.sprite.y * this.scale + go.sprite.height &&
        e.offsetY + this.tileEngine.sy * this.scale >
          go.sprite.y * this.scale - go.sprite.height
      ) {
        this.currPointerStart = { x: e.offsetX, y: e.offsetY };
        this.draggingObject = go;
      }
    });
    return Boolean(this.draggingObject);
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

  doDragging() {
    const p = getPointer();
    this.draggingObject.sprite.x = p.x / this.scale + this.tileEngine.sx;
    this.draggingObject.sprite.y = p.y / this.scale + this.tileEngine.sy;
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
    this.gos.length = 0;
    offPointer('down');
    offPointer('up');
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
