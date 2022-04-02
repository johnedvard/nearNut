import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { load, emit } from 'kontra';
import { tileMapNameDefault } from 'src/app/game/game/gameSettings';
import { LevelEditorService } from '../level-editor.service';
import { EditorState } from '../level-editor/level-editor.component';

@Component({
  selector: 'app-level-toolbar',
  templateUrl: './level-toolbar.component.html',
  styleUrls: ['./level-toolbar.component.sass'],
})
export class LevelToolbarComponent implements OnInit, OnChanges {
  isTilesPanelOpen = false;
  tileSources = [];
  selectedTileSrc;
  @Input() editorState: EditorState;
  @Output() backClick = new EventEmitter();
  tiles: any[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  constructor(private editorService: LevelEditorService) {}
  ngOnChanges(changes: SimpleChanges): void {
    const editorState = (<any>changes).editorState;
    if (editorState && <EditorState>editorState.currentValue === 'playing') {
      this.closeToolbar();
    }
  }

  backButtonClick(evt) {
    this.backClick.emit(evt);
  }

  ngOnInit(): void {
    load(tileMapNameDefault).then((assets) => {
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
      this.selectedTileSrc =
        this.tileSources[this.editorService.tileSubject.getValue()];
    });
  }
  openPaintTool() {
    this.isTilesPanelOpen = !this.isTilesPanelOpen;
  }
  closeToolbar() {
    this.isTilesPanelOpen = false;
  }
  openCustomizePanel() {
    console.log('open dialog');
  }
  handleTilesPanelClick(evt) {
    console.log('handle tile panel click');
    if (evt && evt.target) {
      if (evt.target.id.match('tileIndex-')) {
        this.selectedTileSrc = evt.target.src;
        this.editorService.tileSubject.next(this.getTileId(evt.target.id));
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
