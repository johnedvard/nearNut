import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameModule } from '../game/game.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GameModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
  ],
  exports: [GameModule, MatTabsModule, MatCardModule, MatButtonModule],
})
export class SharedModule {}
