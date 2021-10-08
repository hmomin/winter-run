import {
    iteration,
    generation,
    weights,
} from "../../../assets/game-data/neural-network-data-gen-0.json";
import { bestWeights } from "../../../assets/game-data/autoplay-data.json";
import WinterGirl from "../objects/WinterGirl";
import Santa from "../objects/Santa";
import IceMage from "../objects/IceMage";
import Meteor from "../objects/Meteor";
import Snowman from "../objects/Snowman";
import Yeti from "../objects/Yeti";
import BlackBird from "../objects/BlackBird";
import NeuralNetwork from "../training/NeuralNetwork";
import {
    snowmanPositions1,
    yetiPositions1,
    blackBirdPositions1,
} from "../../../assets/tilemap/level1_enemies.json";
import Individual from "../training/Individual";
import Population from "../training/Population";
import {
    elitismSelection,
    rouletteWheelSelection,
} from "../training/selection";
import simulatedBinaryCrossover from "../training/crossover";
import { randomGaussianMutation } from "../training/mutation";
import * as tf from "@tensorflow/tfjs";
import Snowball from "../objects/Snowball";

export default class GameScene extends Phaser.Scene {
    gameOver = false;
    gameEnded = false;
    wonGame = false;
    beginTime = 60;
    timeRemaining = this.beginTime;
    train: boolean;
    fitnesses: Array<number>;
    NUM_INDIVIDUALS = 100;
    NUM_GENERATIONS = 1000;
    NUM_WEIGHTS = 845;
    MUTATION_RATE = 1;
    SIGMA = 1;
    population: Population;
    avgFitness: Array<number> = [];
    iterCount: number;
    previousIterCount: number;
    xVals: Array<number> = [];
    xValsPenalty = 0;
    generation: number;
    network: NeuralNetwork;
    weights: Array<number>;
    autoplay: boolean;

    backgroundBack: Phaser.GameObjects.TileSprite;
    backgroundFront: Phaser.GameObjects.TileSprite;
    graphics: Phaser.Tilemaps.DynamicTilemapLayer;
    dropOffLocations: Array<[number, number]> = [];
    nextLedgeLocations: Array<[number, number]> = [];
    map: Phaser.Tilemaps.Tilemap;
    tileset: Phaser.Tilemaps.Tileset;

    apples: Phaser.Physics.Arcade.Group;
    bonusBlocks: Phaser.Physics.Arcade.Group;
    coins: Phaser.Physics.Arcade.Group;
    diamonds: Phaser.Physics.Arcade.Group;
    goldChests: Phaser.Physics.Arcade.Group;
    goldKeys: Phaser.Physics.Arcade.Group;
    ground: Phaser.Physics.Arcade.Group;
    hearts: Phaser.Physics.Arcade.Group;
    silverChests: Phaser.Physics.Arcade.Group;
    silverKeys: Phaser.Physics.Arcade.Group;
    spikes: Phaser.Physics.Arcade.Group;
    star: Phaser.Physics.Arcade.Group;

    cam: Phaser.Cameras.Scene2D.Camera;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    fireballsText: Phaser.GameObjects.Text;
    gameOverText: Phaser.GameObjects.Text;
    wonGameText: Phaser.GameObjects.Text;
    livesText: Phaser.GameObjects.Text;
    malletText: Phaser.GameObjects.Text;
    timerText: Phaser.GameObjects.Text;
    texts: Array<Phaser.GameObjects.Text>;

    fireballKey: Phaser.Input.Keyboard.Key;
    malletKey: Phaser.Input.Keyboard.Key;
    mostRecentKey: Phaser.Input.Keyboard.Key;
    keyTrainingMap: Array<Phaser.Input.Keyboard.Key>;
    keyReverseMap = {
        37: "LEFT",
        38: "UP",
        39: "RIGHT",
        71: "MALLET",
        72: "FIREBALL",
    };

    fireballs: Phaser.Physics.Arcade.Group;
    meteors: Phaser.Physics.Arcade.Group;
    helpers: Phaser.Physics.Arcade.Group;
    snowmen: Phaser.Physics.Arcade.Group;
    snowmenObjs: Array<Snowman> = [];
    snowballs: Array<Snowball> = [];
    yetis: Phaser.Physics.Arcade.Group;
    blackBirds: Phaser.Physics.Arcade.Group;
    player: WinterGirl;

    snowmanPositions: Array<number>;
    yetiPositions: Array<number>;
    // move black birds as soon as they enter the camera view
    blackBirdPositions;
    girlYSpeed = 320;

    constructor() {
        super("game");
    }

    create() {
        this.snowmanPositions = snowmanPositions1;
        this.yetiPositions = yetiPositions1;
        this.blackBirdPositions = blackBirdPositions1;
        // now deal with training stuff
        this.autoplay = this.registry.get("autoplay");
        this.train = this.registry.get("train");
        this.fitnesses = this.registry.get("fitnesses");
        if (!localStorage.getItem("iteration")) {
            this.iterCount = iteration;
        } else {
            this.iterCount = this.registry.get("iterCount");
        }
        if (!localStorage.getItem("generation")) {
            this.generation = generation;
        } else {
            this.generation = this.registry.get("generation");
        }
        // retrieve weight and bias data if training
        if (this.train) {
            if (!this.fitnesses) {
                this.fitnesses = [];
            }
            // set all weights to localStorage if they don't exist
            if (!localStorage.getItem("weights")) {
                localStorage.setItem("weights", JSON.stringify(weights));
            }
            localStorage.setItem("iteration", JSON.stringify(this.iterCount));
            localStorage.setItem("generation", JSON.stringify(this.generation));
            // first weights synchronized between localStorage and context
            if (this.iterCount < this.NUM_INDIVIDUALS) {
                const weightsStr: string = localStorage.getItem("weights");
                const tempWeights: Array<number> = JSON.parse(weightsStr);
                const currentWeights: Array<number> = tempWeights.slice(
                    this.iterCount * this.NUM_WEIGHTS,
                    (this.iterCount + 1) * this.NUM_WEIGHTS
                );
                this.network = new NeuralNetwork({
                    weights: currentWeights,
                });
            }
        } else if (this.autoplay) {
            this.network = new NeuralNetwork({ weights: bestWeights });
        }
        this.cam = this.cameras.cameras[0];
        // add backgrounds only if not training
        this.backgroundBack = this.add.tileSprite(
            -this.game.scale.width / 2,
            this.game.scale.height / 2,
            this.game.scale.width * 3,
            this.game.scale.height,
            "background_1"
        );
        this.backgroundFront = this.add.tileSprite(
            -this.game.scale.width / 2,
            this.game.scale.height / 2,
            this.game.scale.width * 3,
            this.game.scale.height,
            "background_2"
        );
        // create map
        this.map = this.make.tilemap({ key: "map1" });
        this.tileset = this.map.addTilesetImage(
            "winter-tileset",
            "tilesheet",
            32,
            32,
            0,
            0
        );
        this.graphics = this.map.createDynamicLayer(
            "graphics",
            this.tileset,
            0,
            0
        );
        this.graphics.setCollisionByExclusion([-1], true);
        const mapData = this.graphics.layer.data;
        // figure out the drop off locations and the next ledge locations
        let dropOffBegins = -1;
        for (let j = 0; j < mapData[0].length; j++) {
            let spaceFound = false;
            for (let i = 0; i < mapData.length; i++) {
                if (mapData[i][j].index !== -1) {
                    spaceFound = true;
                    if (j > 0 && mapData[i][j - 1].index === -1) {
                        this.nextLedgeLocations.push([
                            16 + 32 * j,
                            16 + 32 * i,
                        ]);
                    }
                    break;
                }
            }
            if (!spaceFound && dropOffBegins === -1) {
                dropOffBegins = j;
            } else if (spaceFound && dropOffBegins !== -1) {
                this.dropOffLocations.push([
                    16 + 32 * dropOffBegins,
                    16 + 32 * j,
                ]);
                dropOffBegins = -1;
            }
        }
        // grab background signs and stuff
        this.ground = this.instantiateObjectLayer("ground");

        // add player
        this.player = new WinterGirl(this, 50, 350);
        // debugging high jumps
        if (this.player.debug) {
            this.girlYSpeed = 625;
        }
        this.physics.add.collider(this.player, this.graphics);

        // text
        this.timerText = this.add.text(
            10,
            10,
            "Time Remaining: " + this.timeRemaining,
            {
                fontFamily: "Arial",
                fontSize: 20,
                color: "black",
            }
        );
        this.livesText = this.add.text(
            10,
            35,
            "Lives Remaining: " + this.player.numLives,
            {
                fontFamily: "Arial",
                fontSize: 20,
                color: "black",
            }
        );
        this.malletText = this.add.text(
            10,
            60,
            "Mallet Hits (G): " + this.player.numMallets,
            {
                fontFamily: "Arial",
                fontSize: 20,
                color: "black",
            }
        );
        this.fireballsText = this.add.text(
            10,
            85,
            "Fireballs (H): " + this.player.numFireballs,
            {
                fontFamily: "Arial",
                fontSize: 20,
                color: "black",
            }
        );
        this.gameOverText = this.add.text(
            this.cam.width / 2,
            (3 * this.cam.height) / 10,
            "GAME OVER",
            {
                fontFamily: "Arial",
                fontSize: 60,
                color: "#990000",
            }
        );
        this.gameOverText.setOrigin(0.5, 0.5);
        this.gameOverText.visible = false;
        this.wonGameText = this.add.text(
            this.cam.width / 2,
            (3 * this.cam.height) / 10,
            "YOU WIN!",
            {
                fontFamily: "Arial",
                fontSize: 60,
                color: "#009900",
            }
        );
        this.wonGameText.setOrigin(0.5, 0.5);
        this.wonGameText.visible = false;
        this.texts = [
            this.livesText,
            this.malletText,
            this.fireballsText,
            this.timerText,
            this.gameOverText,
            this.wonGameText,
        ];
        // fix texts in place
        for (const t of this.texts) {
            t.setScrollFactor(0, 0);
        }

        // hearts for extra lives
        this.hearts = this.instantiateObjectLayer("hearts");
        // player grabs heart
        this.physics.add.overlap(
            this.player,
            this.hearts,
            (_, heart) => {
                heart.destroy();
                this.player.numLives++;
            },
            null,
            this
        );

        // apples for speed
        this.apples = this.instantiateObjectLayer("apples");
        // player grabs apple
        this.physics.add.overlap(
            this.player,
            this.apples,
            (_, apple) => {
                apple.destroy();
                this.player.running = true;
            },
            null,
            this
        );

        // coins for mallet attacks
        this.coins = this.instantiateObjectLayer("coins");
        this.coins.children.iterate((c) => {
            (c as any).body.setCircle(16);
        });
        // player grabs coin
        this.physics.add.overlap(
            this.player,
            this.coins,
            (_, coin) => {
                coin.destroy();
                this.player.numMallets++;
            },
            null,
            this
        );

        // diamonds for fireballs
        this.diamonds = this.instantiateObjectLayer("diamonds");
        // player grabs diamond
        this.physics.add.overlap(
            this.player,
            this.diamonds,
            (_, diamond) => {
                diamond.destroy();
                this.player.numFireballs++;
            },
            null,
            this
        );

        // create physics groups (necessary for collisions)
        // fireballs
        this.fireballs = this.physics.add.group({
            allowGravity: false,
        });
        // meteors
        this.meteors = this.physics.add.group({
            allowGravity: false,
        });
        // ice mages and santas
        this.helpers = this.physics.add.group({
            immovable: true,
        });
        // snowmen
        this.snowmen = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        // yetis
        this.yetis = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        // blackbirds
        this.blackBirds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

        // silver keys for silver chests
        this.silverKeys = this.instantiateObjectLayer("silver_key");
        // player grabs silver key
        this.physics.add.overlap(
            this.player,
            this.silverKeys,
            (_, key) => {
                key.destroy();
                this.player.numSilverKeys++;
            },
            null,
            this
        );

        // silver chests
        this.silverChests = this.instantiateObjectLayer("silver_chest");
        // player tries to open silver chest
        this.physics.add.overlap(
            this.player,
            this.silverChests,
            (_, chest) => {
                if (this.player.numSilverKeys > 0) {
                    this.player.numSilverKeys--;
                    chest.destroy();
                    // tslint:disable-next-line: no-unused-expression
                    new Santa(
                        this,
                        this.player.x,
                        this.player.y - 50,
                        this.helpers
                    );
                }
            },
            null,
            this
        );

        // gold keys for gold chests
        this.goldKeys = this.instantiateObjectLayer("gold_key");
        // player grabs gold key
        this.physics.add.overlap(
            this.player,
            this.goldKeys,
            (_, key) => {
                key.destroy();
                this.player.numGoldKeys++;
            },
            null,
            this
        );

        // gold chests
        this.goldChests = this.instantiateObjectLayer("gold_chest");
        // player tries to open gold chest
        this.physics.add.overlap(
            this.player,
            this.goldChests,
            (_, chest) => {
                if (this.player.numGoldKeys > 0) {
                    this.player.numGoldKeys--;
                    chest.destroy();
                    // tslint:disable-next-line: no-unused-expression
                    new IceMage(
                        this,
                        this.player.x,
                        this.player.y - 50,
                        this.helpers
                    );
                }
            },
            null,
            this
        );

        // star at end wins the game
        this.star = this.instantiateObjectLayer("star");
        this.star.children.iterate((s) => {
            (s as any).body.setCircle(16);
        });
        this.physics.add.overlap(
            this.player,
            this.star,
            () => {
                if (!this.train) {
                    this.physics.pause();
                    this.player.play("girl-idle", true);
                    this.wonGame = true;
                }
                this.gameOver = true;
            },
            null,
            this
        );

        // spikes hurt
        this.spikes = this.instantiateObjectLayer("spikes", 16, -24);
        for (const spike of this.spikes.children.entries) {
            this.physics.add.collider(this.player, spike, () => {
                this.player.setVelocityY(-this.girlYSpeed);
                this.player.loseLife();
            });
        }

        // bonus blocks shoot fireballs in random directions
        this.bonusBlocks = this.instantiateObjectLayer("bonus blocks", 16, -15);
        for (const block of this.bonusBlocks.children.entries) {
            this.physics.add.collider(this.player, block, (_, obj) => {
                // tslint:disable-next-line: no-string-literal
                const x = Math.floor(obj["x"] / 32);
                // tslint:disable-next-line: no-string-literal
                const y = Math.floor(obj["y"] / 32);
                obj.destroy();
                // copy the next tile over into where the bonus block used to be
                this.map.copy(x + 1, y, 1, 1, x, y);
                // figure out left-right camera bounds
                const left =
                    Math.round(this.cam.midPoint.x) - this.cam.width / 2;
                const right = left + this.cam.width;
                // shoot meteors from the sky
                // want some element of randomness, but without overlapping
                const positions: Array<number> = [];
                for (let i = 1; i <= 9; i++) {
                    let min = 0;
                    let xPosition = 0;
                    while (min < 32) {
                        xPosition = Phaser.Math.Between(left, right);
                        min = Math.min(
                            ...positions.map((value) => {
                                return Math.abs(value - xPosition);
                            })
                        );
                    }
                    positions.push(xPosition);
                    // tslint:disable-next-line: no-unused-expression
                    new Meteor(
                        this,
                        xPosition,
                        Phaser.Math.Between(-96, -16),
                        this.meteors
                    );
                }
            });
        }

        // instantiate snowmen, yeti, and blackbirds
        for (const pos of this.snowmanPositions) {
            // tslint:disable-next-line: no-unused-expression
            this.snowmenObjs.push(new Snowman(this, pos, 0, this.snowmen));
        }
        for (const pos of this.yetiPositions) {
            // tslint:disable-next-line: no-unused-expression
            new Yeti(this, pos, 0, this.yetis);
        }
        for (const pos of this.blackBirdPositions) {
            // tslint:disable-next-line: no-unused-expression
            new BlackBird(this, pos[0], pos[1], this.blackBirds);
        }

        // cursors
        this.malletKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.G
        );
        this.fireballKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.H
        );
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyTrainingMap = [
            this.cursors.left,
            this.cursors.up,
            this.cursors.right,
            this.malletKey,
            this.fireballKey,
        ];

        // camera follow
        this.cam.startFollow(this.player, false, 0.1, 0, -100, 110);

        // world bounds and falling down
        this.physics.world.setBounds(0, 0, 9504, 480);
        this.physics.world.on("worldbounds", () => {
            if (this.player.x > 32 && this.player.y > 25) {
                this.player.loseLife();
            }
        });

        // collisions between player and meteors
        this.physics.add.overlap(
            this.player,
            this.meteors,
            () => {
                this.player.loseLife();
            },
            null,
            this
        );
    }

    update() {
        // restart the sim with new weights and biases if we got through
        // the six iterations
        if (this.iterCount === this.NUM_INDIVIDUALS) {
            this.iterCount = 0;
            this.generation++;
            // do the actual genetic algorithm offspring stuff
            this.createNextGeneration();
            this.restartScene();
        }
        // check if game over
        if (this.gameOver && !this.gameEnded) {
            this.gameOver = false;
            this.gameEnded = true;
            this.xVals = [];
            // deal with training
            if (this.train) {
                this.iterCount++;
                this.fitnesses.push(this.computeFitness());
                this.restartScene();
            } else {
                this.physics.pause();
                if (this.wonGame) {
                    this.wonGameText.visible = true;
                } else {
                    this.gameOverText.visible = true;
                }
                setTimeout(() => {
                    this.cam.fadeOut(1000);
                    setTimeout(() => {
                        this.timeRemaining = this.beginTime;
                        this.scene.start("title");
                        this.wonGame = false;
                        this.gameEnded = false;
                    }, 1000);
                }, 3000);
            }
        }

        for (const bg of [this.backgroundBack, this.backgroundFront]) {
            bg.tilePositionX += 0.1;
            bg.displayOriginX = -this.cam.scrollX + this.cam.centerX;
        }
        if (this.train || this.autoplay) {
            if (!this.mostRecentKey || this.game.getFrame() % 3 === 0) {
                // if training, ask the neural network what to do every 1/20 second
                // start by getting input from various components of the scene
                this.snowballs = [];
                for (const snowman of this.snowmenObjs) {
                    if (snowman.snowball) {
                        this.snowballs.push(snowman.snowball);
                    }
                }
                const inputs = this.network.scaleInputLayer([
                    this.getNextDropOff(),
                    ...this.getNextLedge(),
                    ...this.getNearestDistance(this.coins.children.entries),
                    ...this.getNearestDistance(this.diamonds.children.entries),
                    ...this.getNearestDistance(this.apples.children.entries),
                    ...this.getNearestDistance(this.hearts.children.entries),
                    ...this.getNearestDistance(
                        this.silverKeys.children.entries
                    ),
                    ...this.getNearestDistance(
                        this.silverChests.children.entries
                    ),
                    ...this.getNearestDistance(this.goldKeys.children.entries),
                    ...this.getNearestDistance(
                        this.goldChests.children.entries
                    ),
                    ...this.getNearestDistance(
                        this.bonusBlocks.children.entries
                    ),
                    ...this.getNearestDistance(this.star.children.entries),
                    ...this.getNearestDistance(this.yetis.children.entries),
                    ...this.getNearestDistance(
                        this.blackBirds.children.entries
                    ),
                    ...this.getNearestDistance(this.snowmen.children.entries),
                    ...this.getNearestDistance(this.snowballs),
                    ...this.getNearestDistance(this.spikes.children.entries),
                    this.player.numLives,
                    this.player.numMallets,
                    this.player.numFireballs,
                ]);
                // feed the input data into the network
                this.network.feedForward(inputs).then(
                    (output) => {
                        // map output to only one of the keys
                        for (const key of this.keyTrainingMap) {
                            key.isDown = false;
                        }
                        this.keyTrainingMap[output].isDown = true;
                        this.mostRecentKey = this.keyTrainingMap[output];
                    },
                    (err) => {}
                );
            } else {
                // just use the most recent key
                for (const key of this.keyTrainingMap) {
                    key.isDown = false;
                }
                this.mostRecentKey.isDown = true;
            }
        }

        this.player.update();

        if (this.game.getFrame() % 60 === 0) {
            // check time
            if (this.timeRemaining === 0 && !this.gameEnded) {
                this.gameOver = true;
            } else if (
                this.timeRemaining > 0 &&
                !this.gameOver &&
                !this.wonGame
            ) {
                this.timeRemaining--;
                if (this.gameEnded) {
                    this.gameEnded = false;
                }
            }
            // set warning color if time goes below 30 seconds
            if (this.timeRemaining === 30) {
                this.timerText.setFill("#aa0000");
            }

            // check if the player hasn't moved in five seconds
            if (this.train) {
                if (this.xVals.length < 10) {
                    this.xVals.push(this.player.x);
                } else {
                    const xVal = this.xVals[0];
                    let allMatch = true;
                    for (const val of this.xVals) {
                        if (val !== xVal) {
                            allMatch = false;
                            break;
                        }
                    }
                    if (allMatch) {
                        // penalize fitness if player is just standing there to promote
                        // exploration / moving around
                        this.xValsPenalty = -this.timeRemaining;
                        this.gameOver = true;
                    } else {
                        this.xVals.push(this.player.x);
                        this.xVals.shift();
                    }
                }
            }
        }

        // update santas, ice mages, fireballs, meteors, snowmen
        for (const group of [
            this.helpers.children.entries,
            this.fireballs.children.entries,
            this.meteors.children.entries,
            this.snowmen.children.entries,
            this.yetis.children.entries,
            this.blackBirds.children.entries,
        ]) {
            for (const obj of group) {
                obj.update();
            }
        }

        // update texts
        this.timerText.setText("Time Remaining: " + this.timeRemaining + "s");
        this.livesText.setText("Lives Remaining: " + this.player.numLives);
        this.malletText.setText("Mallet Hits (G): " + this.player.numMallets);
        this.fireballsText.setText(
            "Fireballs (H): " + this.player.numFireballs
        );
    }

    instantiateObjectLayer(
        groupStr,
        xOffset = 16,
        yOffset = -16
    ): Phaser.Physics.Arcade.Group {
        const group = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        this.map.getObjectLayer(groupStr).objects.forEach((obj) => {
            group.create(obj.x + xOffset, obj.y + yOffset, obj.name);
        });
        return group;
    }

    restartScene() {
        // save information to registry
        this.registry.set("iterCount", this.iterCount);
        this.registry.set("generation", this.generation);
        this.registry.set("fitnesses", this.fitnesses);
        // restart to the beginning state
        this.timeRemaining = this.beginTime;
        this.gameOver = false;
        this.gameEnded = true;
        this.xVals = [];
        this.xValsPenalty = 0;
        // dispose of tensors before restarting
        tf.disposeVariables();
        this.scene.restart();
    }

    computeFitness() {
        return (
            this.player.x ** 2 / 1000 +
            this.timeRemaining +
            this.xValsPenalty +
            100 * this.player.numLives
        );
    }

    createNextGeneration() {
        // first, initialize population if it doesn't exist
        this.population = this.initializePopulation();
        this.avgFitness.push(Math.round(this.population.getAverageFitness()));
        if (this.avgFitness.length > 100) {
            this.avgFitness = [];
        }
        // then, create new individuals by performing selection, crossover,
        // and mutation
        const nextPop = [];
        // get some number of the best individuals from current population
        const bestFromPop = elitismSelection(this.population, 10);
        for (const ind of bestFromPop) {
            nextPop.push(ind);
        }
        while (nextPop.length < this.NUM_INDIVIDUALS) {
            const parents = rouletteWheelSelection(this.population, 2);
            // create offspring through crossover
            const newChromosomes = simulatedBinaryCrossover(
                parents[0],
                parents[1],
                1
            );
            const c1 = new Individual(newChromosomes[0], -Infinity);
            const c2 = new Individual(newChromosomes[1], -Infinity);
            // mutate offspring
            randomGaussianMutation(
                c1,
                this.MUTATION_RATE,
                // this.MUTATION_RATE / (this.generation ** 0.25 + 1),
                [0],
                [this.SIGMA]
            );
            randomGaussianMutation(
                c2,
                this.MUTATION_RATE,
                // this.MUTATION_RATE / (this.generation ** 0.25 + 1),
                [0],
                [this.SIGMA]
            );
            // add offspring to next population
            nextPop.push(c1);
            nextPop.push(c2);
        }
        // set the next generation of individuals
        this.population.individuals = nextPop;
        // finally, set the weights and biases of those new individuals in
        // localStorage
        this.weights = [];
        for (let i = 0; i < this.NUM_INDIVIDUALS; i++) {
            const ind = this.population.individuals[i];
            this.weights.push(...ind.weights);
        }
        localStorage.setItem("weights", JSON.stringify(this.weights));
        this.fitnesses = [];
        this.registry.set("fitnesses", this.fitnesses);
    }

    initializePopulation(): Population {
        // create a list of individuals out of weights from localStorage
        const individuals: Array<Individual> = [];
        const allWeights: Array<number> = JSON.parse(
            localStorage.getItem("weights")
        );
        for (let i = 0; i < this.NUM_INDIVIDUALS; i++) {
            // find weights and fitness for this individual
            const ind = new Individual(
                [
                    allWeights.slice(
                        i * this.NUM_WEIGHTS,
                        (i + 1) * this.NUM_WEIGHTS
                    ),
                ],
                this.fitnesses[i]
            );
            individuals.push(ind);
        }
        return new Population(individuals);
    }

    getNearestDistance(objArray): Array<number> {
        let nearestSquareDist =
            (this.cam.width / 2) ** 2 + (this.cam.height / 2) ** 2;
        let nearestX = -500;
        let nearestY = -500;
        for (const obj of objArray) {
            // tslint:disable-next-line: no-string-literal
            const x = obj.body ? obj.body["x"] : 100000;
            // tslint:disable-next-line: no-string-literal
            const y = obj.body ? obj.body["y"] : 100000;
            if (
                (x - this.player.x) ** 2 + (y - this.player.y) ** 2 <
                nearestSquareDist
            ) {
                nearestX = x - this.player.x;
                nearestY = y - this.player.y;
                nearestSquareDist =
                    (x - this.player.x) ** 2 + (y - this.player.y) ** 2;
            }
        }
        return [nearestX, nearestY];
    }

    getNextDropOff(): number {
        let dist = -500;
        for (const dropOff of this.dropOffLocations) {
            if (dropOff[0] - this.player.x < 0) {
                break;
            } else {
                dist = dropOff[0] - this.player.x;
            }
        }
        return dist;
    }

    getNextLedge(): [number, number] {
        let nextSquareDist =
            (this.cam.width / 2) ** 2 + (this.cam.height / 2) ** 2;
        let nextX = -500;
        let nextY = -500;
        for (const obj of this.nextLedgeLocations) {
            const x = obj[0];
            const y = obj[1];
            if (
                (x - this.player.x) ** 2 + (y - this.player.y) ** 2 <
                    nextSquareDist &&
                x - this.player.x > 0
            ) {
                nextX = x - this.player.x;
                nextY = y - this.player.y;
                nextSquareDist =
                    (x - this.player.x) ** 2 + (y - this.player.y) ** 2;
            }
        }
        return [nextX, nextY];
    }
}
