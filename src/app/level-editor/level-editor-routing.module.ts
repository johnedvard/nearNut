import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LevelEditorComponent } from './level-editor/level-editor.component';

const routes: Routes = [{ path: '', component: LevelEditorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LevelEditorRoutingModule {}
