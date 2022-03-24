import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCharacterComponent } from './select-character/select-character.component';
import { CharacterSelectionComponent } from './character-selection/character-selection.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SelectCharacterComponent, CharacterSelectionComponent],
  imports: [CommonModule, SharedModule],
  exports: [SelectCharacterComponent],
})
export class CharactersModule {}
