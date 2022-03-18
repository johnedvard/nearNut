import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { init, GameLoop, Sprite, load, emit } from 'kontra';
import { Subject } from 'rxjs';
import { EditorEvent } from 'src/app/game/game/editorEvent';

@Component({
  selector: 'app-level-toolbar',
  templateUrl: './level-toolbar.component.html',
  styleUrls: ['./level-toolbar.component.sass'],
})
export class LevelToolbarComponent implements OnInit {
  isTilesPanelOpen = false;
  tileSources = [];
  selectedTileSrc;
  tiles: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  constructor() {}

  ngOnInit(): void {
    load('assets/tilesets/tileset_32x32_default.png').then((assets) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      //384 × 192
      const size = 32;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 6; j++) {
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(
            assets[0],
            size * j,
            size * i,
            size,
            size,
            0,
            0,
            size,
            size
          );
          var target = new Image();
          target.src = canvas.toDataURL();
          this.tileSources.push(target.src);
        }
      }
      this.selectedTileSrc = this.tileSources[7]; // default delete tile
    });
  }
  openPaintTool() {
    this.isTilesPanelOpen = !this.isTilesPanelOpen;
  }
  handleTilesPanelClick(evt) {
    if (evt && evt.target) {
      if (evt.target.id.match('tileIndex-')) {
        this.selectedTileSrc = evt.target.src;
        emit(EditorEvent.selectTile, { tile: this.getTileId(evt.target.id) });
      }
    }
  }

  /**
   * Tilemap is actually 12 tiles long
   */
  getTileId(tileIndex: string) {
    const htmlId: number = parseInt(tileIndex.split('-')[1]);
    let row = 0;
    if (htmlId >= 7) row = 1;
    if (htmlId >= 13) row = 2;
    return htmlId + row * 6;
  }
  initGame() {}
}
