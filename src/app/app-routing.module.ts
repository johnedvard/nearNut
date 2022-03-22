import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginMenuComponent } from './login/login-menu/login-menu.component';
import { SharedModule } from './shared/shared.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'story',
    loadChildren: () =>
      import('./story/story.module').then((m) => m.StoryModule),
  },
  {
    path: 'editor',
    loadChildren: () =>
      import('./level-editor/level-editor.module').then(
        (m) => m.LevelEditorModule
      ),
  },
  {
    path: 'custom',
    loadChildren: () =>
      import('./custom-content/custom-content.module').then(
        (m) => m.CustomContentModule
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
