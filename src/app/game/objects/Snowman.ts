import GameScene from "../scenes/GameScene";
import Snowball from "./Snowball";

export default class Snowman extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    flip = true;
    scene: GameScene;
    attacking = false;
    dead = false;
    colliders: Array<Phaser.Physics.Arcade.Collider> = [];
    snowball: Snowball;
    snowballGroup: Phaser.Physics.Arcade.Group;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        group: Phaser.Physics.Arcade.Group
    ) {
        super(scene, x, y, "snowman");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        group.add(this);
        // collision with ground
        this.scene.physics.add.collider(this, this.scene.graphics);
        this.play("snowman-idle", true);
        this.setFlipX(this.flip);
        // initialize group for snowman
        this.snowballGroup = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        // collision with player
        this.colliders.push(
            this.scene.physics.add.collider(
                this,
                this.scene.player,
                () => {
                    if (this.scene.player.offensive) {
                        this.die();
                    } else {
                        this.scene.player.loseLife();
                    }
                },
                null,
                this.scene
            )
        );
        // collision with fireballs, meteors, ice mages, santas
        for (const g of [
            this.scene.fireballs,
            this.scene.meteors,
            this.scene.helpers,
        ]) {
            this.colliders.push(
                this.scene.physics.add.collider(
                    this,
                    g,
                    () => {
                        this.die();
                    },
                    null,
                    this.scene
                )
            );
        }
    }

    update() {
        if (this.body) {
            // resize
            this.body.setSize(this.displayWidth - 10, this.displayHeight - 10);
            // reset position of snowman to be touching the ground
            this.y = Math.floor(
                this.scene.cam.height -
                    this.scene.tileset.tileHeight -
                    (this.displayHeight - 10) / 2
            );
            // flip based on whether or not the girl is in front or behind
            this.flip = this.x >= this.scene.player.x;
            if (this.flip !== this.flipX) {
                this.toggleFlipX();
            }
            if (!this.dead) {
                // attack if girl is in hitting distance
                if (
                    Math.abs(this.x - this.scene.player.x) <= 500 &&
                    !this.attacking
                ) {
                    this.attacking = true;
                    // shoot a snowball
                    this.play("snowman-attack", true);
                    setTimeout(() => {
                        // need try-catches, because sometimes the scene will
                        // restart while the Snowman object is still active
                        try {
                            if (!this.dead) {
                                this.snowball = new Snowball(
                                    this.scene,
                                    this.x,
                                    this.y,
                                    this.flip,
                                    this.snowballGroup
                                );
                            }
                        } catch (err) {}
                        setTimeout(() => {
                            try {
                                if (!this.dead) {
                                    this.play("snowman-idle", true);
                                }
                            } catch (err) {}
                        }, 1000);
                        setTimeout(() => {
                            try {
                                if (!this.dead) {
                                    this.attacking = false;
                                }
                            } catch (err) {}
                        }, 5000);
                    }, 1600);
                }
                // update snowball if it exists
                if (this.snowball) {
                    this.snowball.update();
                }
            }
        }
    }

    die() {
        this.dead = true;
        // first, destroy the snowball and remove the collider
        if (this.snowball) {
            this.snowball.destroy();
        }
        for (const collider of this.colliders) {
            collider.destroy();
        }
        // animate snowman dying
        this.play("snowman-death", true);
        setTimeout(() => {
            this.destroy();
        }, 2000);
    }
}
