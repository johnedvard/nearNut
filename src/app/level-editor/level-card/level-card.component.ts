import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ILevelData } from 'src/app/game/game/iLevelData';
import { LevelEditorService } from '../level-editor.service';

@Component({
  selector: 'app-level-card',
  templateUrl: './level-card.component.html',
  styleUrls: ['./level-card.component.sass'],
})
export class LevelCardComponent implements OnInit {
  @Input() level: ILevelData;
  @Output() editLevel = new EventEmitter<ILevelData>();
  @Output() playLevel = new EventEmitter<ILevelData>();
  constructor(private levelEditor: LevelEditorService) {}

  ngOnInit(): void {}

  clickEditLevel() {
    this.editLevel.emit(this.level);
  }
  clickPlayLevel() {
    this.playLevel.emit(this.level);
  }
  clickDeleteLevel() {
    this.levelEditor.deleteLevel(this.level);
  }
}
