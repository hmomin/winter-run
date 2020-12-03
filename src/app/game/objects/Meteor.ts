import GameScene from "../scenes/GameScene";

export default class Meteor extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        group: Phaser.Physics.Arcade.Group
    ) {
        super(scene, x, y, "meteor");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        this.rotation = Math.PI / 2;
        group.add(this);
        this.play("meteor", true);
        this.body.setSize(this.displayHeight, this.displayWidth);
        this.setScale(0.25, 0.25);
        this.setVelocityY(200);
    }

    update() {
        if (this.y > 500 || (this.body && this.body.velocity.y === 0)) {
            this.destroy();
        }
    }
}
