import { Component, OnInit } from '@angular/core';
import { loadLevelFromFile } from 'src/app/game/game/gameUtils';
import { ILevelData } from 'src/app/game/game/iLevelData';
import { NearService } from 'src/app/shared/near.service';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass'],
})
export class StoryComponent implements OnInit {
  isPlayingLevel = false;
  selectedLevelId = '';
  constructor(private nearService: NearService) {}

  ngOnInit(): void {}
  onLevelSelect(levelId: string) {
    console.log('load level', levelId);
    this.isPlayingLevel = true;
    this.selectedLevelId = levelId;
  }
  backClick() {
    this.isPlayingLevel = false;
    this.selectedLevelId = '';
  }
}
