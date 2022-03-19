import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ILevelData } from 'src/app/game/game/iLevelData';
import { LevelEditorService } from '../level-editor.service';

type State = 'playing' | 'editing' | 'selecting';
@Component({
  selector: 'app-level-editor',
  templateUrl: './level-editor.component.html',
  styleUrls: ['./level-editor.component.sass'],
})
export class LevelEditorComponent implements OnInit, OnDestroy {
  state: State = 'playing';
  levelsSub: Subscription;
  levels: ILevelData[];
  selectedLevel: ILevelData = null;
  testWidth = new Array<number>(100).fill(0);
  testHeight = new Array<number>(100).fill(0);

  constructor(private leveEditor: LevelEditorService) {}

  ngOnInit(): void {
    this.levelsSub = this.leveEditor.getLevels().subscribe((levels) => {
      this.levels = levels;
    });
  }

  ngOnDestroy(): void {
    if (this.levelsSub) {
      this.levelsSub.unsubscribe();
    }
  }

  onPlayLevel(level: ILevelData): void {
    this.selectedLevel = level;
    this.setState('playing');
  }
  onEditLevel(level: ILevelData): void {
    this.selectedLevel = level;
    this.setState('editing');
  }
  goBackToSelection() {
    this.selectedLevel = null;
    this.setState('selecting');
  }
  setState(state: State): void {
    this.state = state;
  }

  clickCreateNewLevel(): void {
    console.log('Create new level');
    // TODO (johnedvard)
    // Open dialog to create a new NFT
    // Check if name (id) is taken
    // Create new empty NFT (remember to add 1 YoctoNear)
    this.createNewLevelLocalStogare();
  }
  clickTestEditLevel() {
    if (this.state !== 'playing') {
      this.setState('playing');
    } else {
      this.setState('editing');
    }
  }

  /**
   * Temporary solution before integrating with NEAR
   */
  createNewLevelLocalStogare() {
    this.leveEditor.createNewLevel();
  }
}
