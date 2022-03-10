import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-level-card',
  templateUrl: './level-card.component.html',
  styleUrls: ['./level-card.component.sass'],
})
export class LevelCardComponent implements OnInit {
  levelName: string = 'New Level';
  constructor() {}

  ngOnInit(): void {}

  clickEditLevel() {
    console.log('edit this level');
  }
  clickPlayLevel() {
    console.log('edit play this level');
  }
}
