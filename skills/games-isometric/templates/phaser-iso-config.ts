import Phaser from "phaser";
import PhaserIsometric from "phaser-isometric";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  plugins: {
    scene: [
      { key: "Isometric", plugin: PhaserIsometric, mapping: "iso" }
    ]
  },
  scene: [IsoGameScene],
};
