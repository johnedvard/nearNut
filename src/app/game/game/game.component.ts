import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Game } from './game';
import { ILevelData } from './iLevelData';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass'],
})
export class GameComponent implements OnInit {
  @Input() level: ILevelData;
  game: Game;
  constructor() {}

  ngOnInit(): void {
    this.game = new Game();
  }
}
