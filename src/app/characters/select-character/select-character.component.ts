import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CharacterSelectionComponent } from '../character-selection/character-selection.component';

@Component({
  selector: 'app-select-character',
  templateUrl: './select-character.component.html',
  styleUrls: ['./select-character.component.sass'],
})
export class SelectCharacterComponent implements OnInit {
  isCharacterSelectionOpen = false;
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  openCharacterSelection() {
    const dialogRef = this.dialog.open(CharacterSelectionComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
