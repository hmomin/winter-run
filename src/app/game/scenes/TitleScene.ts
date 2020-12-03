export default class TitleScene extends Phaser.Scene {
    backgroundBack: Phaser.GameObjects.TileSprite;
    backgroundFront: Phaser.GameObjects.TileSprite;
    logo: Phaser.GameObjects.Image;
    playButton: Phaser.GameObjects.Image;
    playing: boolean;
    autoplayButton: Phaser.GameObjects.Image;
    gameSettings: any;
    defaultSettings: any = [{ setting: "musicOn", value: true }];
    musicOnButton: Phaser.GameObjects.Image;
    musicOffButton: Phaser.GameObjects.Image;

    constructor() {
        super("title");
    }

    create() {
        console.log("TitleScene: enter create()");
        // get settings
        this.gameSettings = JSON.parse(
            localStorage.getItem("winterRunSettings")
        );
        if (this.gameSettings === null || this.gameSettings.length <= 0) {
            localStorage.setItem(
                "winterRunSettings",
                JSON.stringify(this.defaultSettings)
            );
            this.gameSettings = this.defaultSettings;
        }

        // play music by default...
        if (!this.playing) {
            this.sound.play("music", {
                loop: true,
                volume: 0.25,
            });
            this.playing = true;
        }
        // ...but check if it should be disabled
        if (!this.gameSettings[0].value) {
            this.sound.pauseAll();
        }

        // add backgrounds
        this.backgroundBack = this.add.tileSprite(
            this.game.scale.width / 2,
            this.game.scale.height / 2,
            this.game.scale.width,
            this.game.scale.height,
            "background_1"
        );
        this.backgroundFront = this.add.tileSprite(
            this.game.scale.width / 2,
            this.game.scale.height / 2,
            this.game.scale.width,
            this.game.scale.height,
            "background_2"
        );

        // logo
        this.logo = this.add.image(
            this.game.scale.width / 2,
            this.game.scale.height * 0.2,
            "logo"
        );
        this.logo.setScale(0.8);

        // play button
        this.playButton = this.add.image(
            this.game.scale.width / 2,
            this.game.scale.height * 0.5,
            "play"
        );
        this.playButton.setScale(0.8);
        this.playButton.setInteractive({ useHandCursor: true });
        this.playButton.on("pointerdown", () => {
            this.registry.set("train", false);
            this.registry.set("autoplay", false);
            this.scene.transition({
                target: "game",
                duration: 0,
            });
        });

        // autoplay button
        this.autoplayButton = this.add.image(
            this.game.scale.width / 2,
            this.game.scale.height * 0.65,
            "autoplay"
        );
        this.autoplayButton.setScale(0.8);
        this.autoplayButton.setInteractive({ useHandCursor: true });
        this.autoplayButton.on("pointerdown", () => {
            this.registry.set("train", false);
            this.registry.set("autoplay", true);
            this.scene.transition({
                target: "game",
                duration: 0,
            });
        });

        this.cameras.main.fadeIn(1000);

        // music on button
        this.musicOnButton = this.add.image(
            this.game.scale.width / 2,
            this.game.scale.height * 0.8,
            "music-on"
        );
        if (!this.gameSettings[0].value) {
            this.musicOnButton.setVisible(false);
        }
        this.musicOnButton.setScale(0.8);
        this.musicOnButton.setInteractive({ useHandCursor: true });
        this.musicOnButton.on("pointerdown", () => {
            // pause music
            this.playing = false;
            this.sound.pauseAll();
            // swap buttons
            this.musicOnButton.setVisible(false);
            this.musicOffButton.setVisible(true);
            // set local storage
            this.gameSettings[0].value = false;
            localStorage.setItem(
                "winterRunSettings",
                JSON.stringify(this.gameSettings)
            );
        });

        // music off button
        this.musicOffButton = this.add.image(
            this.game.scale.width / 2 + 13,
            this.game.scale.height * 0.8 - 3,
            "music-off"
        );
        if (this.gameSettings[0].value) {
            this.musicOffButton.setVisible(false);
        }
        this.musicOffButton.setScale(0.875);
        this.musicOffButton.setInteractive({ useHandCursor: true });
        this.musicOffButton.on("pointerdown", () => {
            // restart music
            this.playing = true;
            this.sound.resumeAll();
            // swap buttons
            this.musicOffButton.setVisible(false);
            this.musicOnButton.setVisible(true);
            // set local storage
            this.gameSettings[0].value = true;
            localStorage.setItem(
                "winterRunSettings",
                JSON.stringify(this.gameSettings)
            );
        });
    }

    update() {
        this.backgroundBack.tilePositionX += 0.1;
        this.backgroundFront.tilePositionX += 0.1;
    }
}
