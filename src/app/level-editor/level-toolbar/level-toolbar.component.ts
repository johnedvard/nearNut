import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { load, emit } from 'kontra';
import { Subscription } from 'rxjs';
import { tileMapNameDefault } from 'src/app/game/game/gameSettings';
import { LevelEditorService } from '../level-editor.service';
import { EditorState } from '../level-editor/level-editor.component';

@Component({
  selector: 'app-level-toolbar',
  templateUrl: './level-toolbar.component.html',
  styleUrls: ['./level-toolbar.component.sass'],
})
export class LevelToolbarComponent implements OnInit, OnDestroy, OnChanges {
  isTilesPanelOpen = false;
  tileSources: { src: string; tile: number }[] = [];
  selectedTileSrc: string;
  selectedTool: any;
  toolPanelBtns = [
    { imgSrc: 'tool', tool: 'someTool' },
    { imgSrc: 'tool2', tool: 'someTool2' },
  ];
  selectedToolSub: Subscription;

  @Input() editorState: EditorState;
  @Output() backClick = new EventEmitter();
  constructor(private editorService: LevelEditorService) {
    this.selectedToolSub = editorService.getSelectedTool().subscribe((tool) => {
      this.selectedTool = tool;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    const editorState = (<any>changes).editorState;
    if (editorState && <EditorState>editorState.currentValue === 'playing') {
      this.closeToolbar();
    }
  }

  backButtonClick(evt) {
    this.backClick.emit(evt);
  }

  handleToolClick(btn: any) {
    this.editorService.setSelectedTool(btn.tool);
    this.selectedTool = btn.tool;
  }

  ngOnInit(): void {
    load(tileMapNameDefault).then((assets) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      //384 × 192
      const size = 32;

      const numTilePrWitdth = 12;
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
          this.tileSources.push({
            src: target.src,
            tile: i * numTilePrWitdth + j + 1, // plus one because tilemap uses firstindex 1
          });
        }
      }
      const tileSource = this.tileSources.find((tileSource) => {
        console.log(tileSource);
        return tileSource.tile === this.editorService.tileSubject.getValue();
      });
      console.log('tileSource', tileSource);
      this.selectedTileSrc = tileSource.src;
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
        const tileId = parseInt(evt.target.id.split('-')[1]);
        this.editorService.tileSubject.next(tileId);
      }
    }
  }

  ngOnDestroy() {
    if (this.selectedToolSub) {
      this.selectedToolSub.unsubscribe();
    }
  }
}
