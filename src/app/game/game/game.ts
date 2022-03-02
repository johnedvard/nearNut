import { init, Sprite, GameLoop, initKeys, initPointer } from 'kontra';

export class Game {
  canvas: HTMLCanvasElement;
  sprites: Sprite[] = [];
  loop: GameLoop;
  constructor() {
    const { canvas } = init('game');
    initKeys();
    initPointer();
    this.canvas = canvas;

    this.loop = GameLoop({
      // create the main game loop
      update: () => {
        // update the game state
        this.sprites.forEach((sprite: any) => {
          sprite.update();
        });
      },
      render: () => {
        // render the game state
        this.sprites.forEach((sprite: any) => {
          sprite.render();
        });
      },
    });

    this.loop.start(); // start the game
  }
}
