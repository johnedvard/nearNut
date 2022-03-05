import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { StoryComponent } from './story/story.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [StoryComponent],
  imports: [CommonModule, StoryRoutingModule, SharedModule],
})
export class StoryModule {}
