import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { load, emit, GameLoop } from 'kontra';
import { Subscription } from 'rxjs';
import { tileMapNameDefault } from 'src/app/game/game/gameSettings';
import { Tool } from 'src/app/game/game/tool';
import { LevelEditorService } from '../level-editor.service';
import { EditorState } from '../level-editor/level-editor.component';

type ToolBtn = { imgSrc: string; tool: Tool };

@Component({
  selector: 'app-level-toolbar',
  templateUrl: './level-toolbar.component.html',
  styleUrls: ['./level-toolbar.component.sass'],
})
export class LevelToolbarComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  isTilesPanelOpen = false;
  tileSources: { src: string; tile: number }[] = [];
  selectedTileSrc: string;
  selectedTool: Tool;
  toolPanelBtns: ToolBtn[] = [
    { imgSrc: 'tool', tool: new Tool('goblinBomber') },
    { imgSrc: 'tool2', tool: new Tool('doorSwitch') },
  ];
  selectedToolSub: Subscription;

  @ViewChildren('toolCanvas') toolCanvas: QueryList<ElementRef>;
  @Input() editorState: EditorState;
  @Output() backClick = new EventEmitter();
  constructor(private editorService: LevelEditorService) {
    this.selectedToolSub = editorService.getSelectedTool().subscribe((tool) => {
      if (tool) {
        this.selectedTool = tool;
        this.selectedTool.isActive = true;
      }
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

  handleToolClick(tool: Tool) {
    console.log('click tool', tool);
    if (this.selectedTool) {
      this.selectedTool.isActive = false;
    }
    this.editorService.setSelectedTool(tool);
  }

  ngOnInit(): void {
    load(tileMapNameDefault).then((assets) => {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'tileCanvas');
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
        return tileSource.tile === this.editorService.tileSubject.getValue();
      });
      this.selectedTileSrc = tileSource.src;
    });
  }
  /**
   * Creates a game loop for each tool (canvas) with it's own context
   */
  createGameLoops() {
    this.toolCanvas.forEach((res, index) => {
      const ctx = res.nativeElement.getContext('2d');
      this.toolPanelBtns[index].tool.setContext(ctx);
      const loop = GameLoop({
        context: ctx,
        update: (dt) => {
          this.toolPanelBtns[index].tool.update(dt);
        },
        render: () => {
          this.toolPanelBtns[index].tool.render();
        },
      });
      loop.start();
    });
  }
  ngAfterViewInit() {
    this.createGameLoops();
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
