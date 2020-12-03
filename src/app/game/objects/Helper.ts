import GameScene from "../scenes/GameScene";

export default class Helper extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: GameScene;
    nameStr: string;
    lives: integer;
    hitFloor = false;
    invulnerable = false;
    dead = false;

    constructor(
        scene: GameScene,
        nameStr: string,
        x: number,
        y: number,
        lives: integer,
        group: Phaser.Physics.Arcade.Group
    ) {
        super(scene, x, y, nameStr);
        this.scene = scene;
        this.nameStr = nameStr;
        this.lives = lives;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        group.add(this);
        // collision with ground
        this.scene.physics.add.collider(this, this.scene.graphics);
        // collisions with enemies
        for (const g of [
            this.scene.snowmen,
            this.scene.yetis,
            this.scene.blackBirds,
        ]) {
            this.scene.physics.add.collider(
                this,
                g,
                () => {
                    this.hit();
                },
                null,
                this.scene
            );
        }
    }

    update() {
        // move forward once we touch land
        if (!this.hitFloor) {
            if (!this.body.onFloor()) {
                this.play(this.nameStr + "-idle", true);
            } else {
                this.hitFloor = true;
                this.setVelocityX(200);
                this.play(this.nameStr + "-walk", true);
            }
        }
        if (this.body) {
            this.body.setSize(this.displayWidth, this.displayHeight);
            // die if fall
            if (this.body.y > 500) {
                this.die();
            }
        }
    }

    hit() {
        if (!this.invulnerable) {
            this.invulnerable = true;
            this.lives--;
            if (this.lives === 0) {
                this.die();
            }
            setTimeout(() => {
                this.invulnerable = false;
            }, 1000);
        }
    }

    die() {
        this.dead = true;
        this.setVelocityX(0);
        this.play(this.nameStr + "-death", true);
        setTimeout(() => {
            this.destroy();
        }, 2000);
    }
}
