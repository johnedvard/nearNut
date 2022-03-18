import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameModule } from '../game/game.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GameModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
  ],
  exports: [
    GameModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
  ],
})
export class SharedModule {}
