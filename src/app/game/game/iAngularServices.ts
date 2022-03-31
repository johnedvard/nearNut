import { LevelEditorService } from 'src/app/level-editor/level-editor.service';
import { GameService } from 'src/app/shared/game.service';
import { NearService } from 'src/app/shared/near.service';

export interface IAngularServices {
  gameService?: GameService;
  nearService?: NearService;
  editorService?: LevelEditorService;
}
