import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeModule } from 'src/app/home/home.module';
import { CustomContentModule } from './custom-content/custom-content.module';
import { LevelEditorModule } from './level-editor/level-editor.module';
import { StoryModule } from './story/story.module';

// TODO (johnedvard) Figure out how to correctly lazy load modules on itch.io. Don't lazy load for the time being
const routes: Routes = [
  {
    path: '',
    loadChildren: () => HomeModule,
  },
  {
    path: 'story',
    loadChildren: () => StoryModule,
  },
  {
    path: 'editor',
    loadChildren: () => LevelEditorModule,
  },
  {
    path: 'custom',
    loadChildren: () => CustomContentModule,
  },
  {
    path: '**',
    loadChildren: () => HomeModule,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
