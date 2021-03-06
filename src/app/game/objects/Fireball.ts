import GameScene from "../scenes/GameScene";

export default class Fireball extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene;
    movingRight: boolean;
    multiplier: integer;
    maxX: number;

    constructor(scene, physicsGroup) {
        super(scene, scene.player.x, scene.player.y, "fireball");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        physicsGroup.add(this);
        this.play("fireball", true);
        this.movingRight = !scene.player.flipX;
        this.multiplier = this.movingRight ? 1 : -1;
        this.body.velocity.x = this.multiplier * 350;
        this.maxX = this.movingRight
            ? this.scene.player.x + 400
            : this.scene.player.x - 400;
        this.setScale(0.25, 0.25);
        this.body.setCircle(40);
    }

    update() {
        if (
            (this.movingRight && this.x > this.maxX) ||
            (!this.movingRight && this.x < this.maxX) ||
            (this.body && this.body.velocity.x === 0)
        ) {
            this.destroy();
        }
    }
}
