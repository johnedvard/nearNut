import { GameLoop, init, initKeys, initPointer, TileEngine } from 'kontra';
import { loadLevelFromObject } from './gameUtils';
import { ILevelData } from './iLevelData';

export class LevelEditor {
  scale = 1;
  constructor(level: ILevelData) {
    const id = 'game';
    const { canvas } = init(id);
    initKeys();
    initPointer();
    if (level) {
      loadLevelFromObject(level).then(({ tileEngine, levelData }) => {
        this.initEditorLoop({ tileEngine, canvas });
      });
    }
  }

  initEditorLoop({ tileEngine, canvas }) {
    canvas.height = tileEngine.mapheight * this.scale;
    canvas.width = tileEngine.mapwidth * this.scale;
    const loop = GameLoop({
      update: (dt: number) => {},
      render: () => {
        if (tileEngine) {
          tileEngine.render();
        }
      },
    });
    loop.start();
  }
}
