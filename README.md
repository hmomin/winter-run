# NOTE: Winter Run has now been solved with PPO! Please navigate [here](https://github.com/hmomin/ppo-winter-run) to check it out and disregard everything below.

Winter Run is a game written in TypeScript, Angular, and Phaser that can learn to play itself via a custom genetic algorithm. You can play it live [here](https://winter-run.com)! After 1000 generations of training over the span of three weeks, the best neural network can make it about halfway through the game. It's possible that a different learning algorithm (for instance, deep Q-learning) may have been able to successfully complete the game.

## Installation

In order to run the project locally, you will need to make sure you have Node.js and Angular CLI installed. To check if you have Node, open a command prompt and type `node -v` and hit enter. If the prompt doesn't tell you the version of Node that you have, you don't have it installed. Here is a [link](https://nodejs.org/en/download/) to download it: I highly recommend installing the LTS (long-term support) version. Once the installer has finished, try `node -v` again and you should see your version of Node show up.

<p align="center">
  <img src="https://dr3ngl797z54v.cloudfront.net/node_version.PNG" width="100%" alt="Node Version">
</p>

From there, using the command prompt, navigate into the directory where you would like to install the Github repository. Then, perform the following five commands:

```
git clone https://github.com/hmomin/winter-run
cd winter-run
npm install -g @angular/cli
npm install
npm start
```

The first command clones the repository into your desired location - you can also download it manually off of Github if you don't have Git installed on your machine. The next commands move into the newly created `winter-run` directory, install Angular CLI globally, install all Node modules and dependencies, and then open the compiled Angular project in your browser.

<p align="center">
  <img src="https://dr3ngl797z54v.cloudfront.net/winter_run_intro.PNG" width="100%" alt="Winter Run Layout">
</p>

## Functionality

You can start playing Winter Run just by pressing the play button in the middle. Use the arrow keys to move around, the 'g' key to whack enemies with your mallet, and the 'h' key to shoot fireballs at enemies. Each coin gives you a mallet strike and each diamond gives you a fireball you can throw.

<p align="center">
  <img src="https://dr3ngl797z54v.cloudfront.net/winter_run_play.PNG" width="100%" alt="Play Winter Run">
</p>

Alternatively, you can hit the 'autoplay' button to play the best trained neural network from the 1000<sup>th</sup> generation.

<p align="center">
  <img src="https://dr3ngl797z54v.cloudfront.net/winter_run_autoplay.PNG" width="100%" alt="Autoplay Winter Run">
</p>

You can also click the 'train' button above the game window to initiate training neural networks on the game. Each network takes as inputs 36 values extracted from the scene, including the next drop off location, the next ledge, the nearest distance to a coin, etc. Each network also has 20 hidden nodes and an output layer of 5 nodes. The nodes in the output layer map to LEFT, UP, RIGHT, G, and H, i.e. the action the agent takes. Networks reproduce via simulated binary crossover (SBX) applied to a fitness-proportionate selection of the population. Weights and biases are mutated under a Gaussian distribution. For more information about SBX or mutation, here is a [short reference](https://engineering.purdue.edu/~sudhoff/ee630/Lecture04.pdf).

Each run-through is a single iteration of a single generation - we can't perform all of the iterations for each generation at the same time within a single browser, since some of the players may affect their enemies and some may not. You can see how progress is being made by viewing the local storage within your browser as the game is training.

<p align="center">
  <img src="https://dr3ngl797z54v.cloudfront.net/winter_run_local_storage.PNG" width="100%" alt="Winter Run Local Storage">
</p>

## License

All files in the repository are under the MIT license.