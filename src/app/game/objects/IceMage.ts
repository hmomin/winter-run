import GameScene from "../scenes/GameScene";
import Helper from "./Helper";

export default class IceMage extends Helper {
    constructor(
        scene: GameScene,
        x: number,
        y: number,
        group: Phaser.Physics.Arcade.Group
    ) {
        super(scene, "ice-mage", x, y, 3, group);
    }
}
