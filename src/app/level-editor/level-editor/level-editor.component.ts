import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ILevelData } from 'src/app/game/game/iLevelData';
import { LevelEditorService } from '../level-editor.service';

@Component({
  selector: 'app-level-editor',
  templateUrl: './level-editor.component.html',
  styleUrls: ['./level-editor.component.sass'],
})
export class LevelEditorComponent implements OnInit, OnDestroy {
  levelsSub: Subscription;
  levels: ILevelData[];
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

  clickCreateNewLevel() {
    console.log('Create new level');
    // TODO (johnedvard)
    // Open dialog to create a new NFT
    // Check if name (id) is taken
    // Create new empty NFT (remember to add 1 YoctoNear)
    this.createNewLevelLocalStogare();
  }

  /**
   * Temporary solution before integrating with NEAR
   */
  createNewLevelLocalStogare() {
    this.leveEditor.createNewLevel();
  }
}
