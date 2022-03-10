import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LevelEditorRoutingModule } from './level-editor-routing.module';
import { LevelEditorComponent } from './level-editor/level-editor.component';
import { SharedModule } from '../shared/shared.module';
import { LevelCardComponent } from './level-card/level-card.component';

@NgModule({
  declarations: [LevelEditorComponent, LevelCardComponent],
  imports: [CommonModule, LevelEditorRoutingModule, SharedModule],
})
export class LevelEditorModule {}
