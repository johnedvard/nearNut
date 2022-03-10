import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-level-editor',
  templateUrl: './level-editor.component.html',
  styleUrls: ['./level-editor.component.sass'],
})
export class LevelEditorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  clickCreateNewLevel() {
    console.log('Create new level');
    // TODO (johnedvard)
    // Open dialog to create a new NFT
    // Check if name (id) is taken
    // Create new empty NFT (remember to add 1 YoctoNear)
  }
}
