import GameScene from "../scenes/GameScene";
import Helper from "./Helper";

export default class Santa extends Helper {
    constructor(
        scene: GameScene,
        x: number,
        y: number,
        group: Phaser.Physics.Arcade.Group
    ) {
        super(scene, "santa", x, y, 2, group);
    }
}
