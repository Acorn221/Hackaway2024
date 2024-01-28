/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import Phaser from 'phaser';
import { useEffect, useState } from 'react';

class Player extends Phaser.Physics.Arcade.Sprite {
  // @ts-ignore
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    // Animation setup (assuming you have corresponding images)
    this.scene.anims.create({
      key: 'dance',
      frames: this.scene.anims.generateFrameNumbers('player'),
      frameRate: 10,
      repeat: -1,
    });
  }

  // A method that could be called each frame update
  playDance() {
    this.anims.play('dance', true);
  }
}

class Guitar extends Phaser.Physics.Arcade.Sprite {
  // @ts-ignore
  constructor(scene, x, y) {
    super(scene, x, y, 'guitar');

    // Animation setup
    this.scene.anims.create({
      key: 'play',
      frames: this.scene.anims.generateFrameNumbers('guitar'),
      frameRate: 10,
      repeat: -1,
    });
  }

  playGuitar() {
    this.anims.play('play', true);
    // here you handle the music rhythm and timing. You can let Phaser's time events let your rhythm flow
  }
}

class ExampleScene extends Phaser.Scene {
  player: Player | null = null;

  guitar: Guitar | null = null;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  constructor() {
    super('Example');
  }

  preload() {
    this.load.image('logo', 'assets/phaser3-logo.png');
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('guitar', 'assets/guitar.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    // Create player
    this.player = new Player(this, 100, 450);
    this.add.existing(this.player);

    // Create guitar
    this.guitar = new Guitar(this, 200, 450);
    this.add.existing(this.guitar);

    if (!this.input.keyboard) {
      return;
    }

    // Keyboard setup
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Update player actions based on cursor input
    if (!this.cursors || !this.player || !this.guitar) {
      return;
    }
    if (this.cursors.left.isDown) {
      this.player.playDance();
    } else if (this.cursors.right.isDown) {
      this.guitar.playGuitar();
    }
  }
}
const exampleScene = new ExampleScene();

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: '#282c34',
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [exampleScene],
};
// eslint-disable-next-line import/no-anonymous-default-export
export default config;

const GameContainer = () => {
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    setGame(new Phaser.Game(config));
  }, []);

  return (
    <div id="phaser-container" />
  );
};

export { GameContainer };
