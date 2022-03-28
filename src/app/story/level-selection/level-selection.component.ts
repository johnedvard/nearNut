import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-level-selection',
  templateUrl: './level-selection.component.html',
  styleUrls: ['./level-selection.component.sass'],
})
export class LevelSelectionComponent implements OnInit {
  levels = [
    { id: '001' },
    { id: '002' },
    { id: '003' },
    { id: '004' },
    { id: '005' },
  ];
  constructor() {}

  ngOnInit(): void {}

  selectLevel(level: any) {
    console.log('open level', level);
  }
}
