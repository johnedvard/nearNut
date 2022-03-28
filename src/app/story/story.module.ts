import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story/story.component';
import { SharedModule } from '../shared/shared.module';
import { LoginModule } from '../login/login.module';
import { LevelSelectionComponent } from './level-selection/level-selection.component';

@NgModule({
  declarations: [StoryComponent, LevelSelectionComponent],
  imports: [CommonModule, StoryRoutingModule, SharedModule, LoginModule],
})
export class StoryModule {}
