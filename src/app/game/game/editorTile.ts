import { TileEngine } from 'kontra';
import { edgeLabels, MainBlockType } from './mainBlockType';

export class EditorTile {
  private _tile: MainBlockType;
  constructor(
    private _layerName,
    private _col,
    private _row,
    private tileEngine: TileEngine
  ) {
    this._tile = this.tileEngine.tileAtLayer(this.layerName, {
      row: this._row,
      col: this._col,
    });
  }

  isValidNeighbour(direction: string, tile: MainBlockType) {
    const included =
      !this.validNeighbourTiles(direction).length ||
      this.validNeighbourTiles(direction).includes(tile);
    console.log('direction,tile, ', direction, tile);
    return included;
  }

  validNeighbourTiles(direction: string): MainBlockType[] {
    if (edgeLabels[this.tile]) {
      return edgeLabels[this.tile][direction] || [];
    }
    return [];
  }
  get tile() {
    return this._tile;
  }
  get layerName() {
    return this._layerName;
  }
  get row() {
    return this._row;
  }
  get col() {
    return this._col;
  }
  get idStr() {
    return MainBlockType[this.tile];
  }
}
