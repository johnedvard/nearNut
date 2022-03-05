import { Component, OnInit } from '@angular/core';
import { Game } from './game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass'],
})
export class GameComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    new Game();
  }
}
