import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameModule } from '../game/game.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, GameModule],
  exports: [GameModule],
})
export class SharedModule {}
